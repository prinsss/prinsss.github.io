---
title: 'Laravel 框架下的插件机制实现（一）—— 构建插件系统'
date: '2016-11-20 15:41:25'
updated: '2016-11-20 15:42:06'
categories: 技术
tags:
  - Laravel
  - PHP
---

插件，即 Plug-in（又有外挂、Extension、Addon 等叫法），是一类特定的功能模块，通过和应用程序的互动，用来替应用程序增加一些所需要的特定的功能。插件的特点是：

- 当你需要它的时候激活它，不需要它的时候禁用/删除它；
- 无论是激活还是禁用都不影响系统核心模块的运行。

也就是说插件是一种非侵入式的模块化设计，实现了核心程序与插件程序的松散耦合。上面的介绍部分摘自 [中文 WikiPedia](https://zh.wikipedia.org/wiki/%E6%8F%92%E4%BB%B6)。

虽然现在网上有很多 PHP 的插件机制的实现（当然我指的是英文内容，中文关于 PHP 插件机制的搜出来现在还是那么点破文章），譬如 [FoolCode/Plugin](https://github.com/FoolCode/Plugin)，或者 WordPress 的插件实现。

不过我今天想介绍的是如何使用 Laravel 的服务容器、事件机制等功能来实现一个比较优雅的插件机制。

*Greatly inspired by [Flarum](https://github.com/flarum/core/tree/master/src/Extension)*，在此致谢 ヾ(´ωﾟ｀)

<!--more-->

> 这是这个系列的第一篇，主要描述了该如何构建一个插件系统。第二篇则会讲述该如何利用这个插件系统开发一个插件。

该开始了 ![](https://img.prin.studio/legacy/image.php?di=CFTF)

----------------

## 0x01 目录结构

首先我们要想好每个插件的目录结构 **应该是啥样的**，譬如哪里存储 **插件元信息**，在哪里给插件存放 **初始化代码**，在哪里给插件存放自己的 **业务逻辑** 等等。

举些栗子：WordPress 的插件信息是直接存储在 PHP 文件的注释里的，Flarum 甚至是直接用 composer 来管理插件（每个插件都是一个 composer 包，插件信息就在 `composer.json`）里，也是猛的不行 ( ;ﾟдﾟ)

然而我们还得照顾虚拟主机用户，所以直接用 composer 管理虽然屌，但还是有点不适合。最终我选择的目录结构是这样的：

```
➜  bs-super-cache git:(master)$ tree
.
├── bootstrap.php # 引导文件
├── lang          # 语言文件
├── package.json  # 存放插件信息（必须）
├── src           # 该文件夹下的类将会被自动加载
│   └── Listener
│       ├── CacheAvatarPreview.php
│       ├── CachePlayerJson.php
│       └── CacheSkinPreview.php
└── views         # 视图文件
    └── config.tpl
```

其中使用了 `package.json` 文件来存储插件信息和 `bootstrap.php` 作为引导文件。

其中 `package.json` 的内容应该像这样：

```
{
  "name": "bs-super-cache",
  "version": "1.0",
  "title": "BS Super Cache",
  "description": "缓存皮肤预览图、头像、玩家 Json，优化站点性能。",
  "author": "printempw",
  "namespace": "SuperCache",
  "config": "config.tpl"
}
```

其中的字段 `name` 将成为插件的 **唯一标识符**，而插件所在的文件夹名称是不需要在意的。

其他的字段大部分都是能够通过名字看出作用来的，所以我就不多赘述。关于那个 `namespace` 下面会讲。

而引导文件 `bootstrap.php` 应该返回一个 **闭包 Closure**，并且在这个闭包里执行插件的初始化工作。关于这玩意会在下面的 0x04 里详细描述。

## 0x02 `Plugin` 插件抽象类

想好了目录结构，接下来我们需要一个 `Plugin` 类来方便从文件系统加载并存储插件信息用于这次请求的生命周期（放到容器里）。

关于 `Plugin` 这个类，它是每一个具体插件的抽象，我们需要通过这玩意来进行 **获取插件信息**、**启用/禁用**、**安装/删除** 等操作，所以类也必须提供相应的方法（代码块放在 Gist 上）：

<script src="https://gist.github.com/prinsss/8bc1049481f2ba0be51eba4edccea2d5.js"></script>

可以看到我们在类中使用了 `$packageInfo` 这个属性来存储 `json_decode` 解析后的 `package.json` 的内容，并通过一堆 `getter` 和 `setter` 实现了上述的功能。

我们同时还实现了一些魔术方法，以让我们能够更方便的获取插件的信息。

## 0x03 `PluginManager` 插件经理类

这个插件经理类也是这个插件系统中很重要的一部分了，它主要负责扫描文件系统并 **加载所有插件**、查询数据库**获取插件的启用情况**、在插件被 启用/禁用/删除 时**触发相应事件**好让插件能够做出反应。

<script src="https://gist.github.com/prinsss/e1cc9516189c800cd50ad7955adfc1b2.js"></script>

可以看到我们在 `PluginManager` 类的构造函数中使用了类型提示，这可以让 Laravel 的服务容器为我们注入我们需要的依赖。

在 `getPlugins()` 方法中，我们遍历了项目根目录下的 `plugins` 目录（当然这个目录的位置你可以随意定制）。所有含有 `package.json` 的子目录都被我们视做一个个插件，并把它们实例化为 `Plugin` 对象，然后存放到自身的 `plugins` 属性中。

其他诸如启用、禁用插件的方法中都应该 **触发事件** 让插件能够在临死之前打扫一下自己留下的东西（数据库记录等）或者执行初始化等工作。

`getEnabledBootstrappers()` 这个方法返回了一个储存了所有已启用插件的引导文件路径的集合，这个将在下面用到。

**题外话**：我给李们港，`Illuminate\Support` 下的包，超好用的！(つд⊂)

## 0x04 `PluginServiceProvider` 服务提供者

在这个服务提供者里，我们将把 `PluginManager` 绑定到服务容器上，并且初始化所有的插件。

<script src="https://gist.github.com/prinsss/8b3632231a999a2fc1bf949d97608530.js"></script>

可以看到，我们在 `require` 了各个插件的 `bootstrap.php` 文件得到了 `Closure` 对象后，使用了服务容器的 `call()` 方法调用了这个闭包。这也就意味着我们可以在 `bootstrap.php` 开心地使用 Laravel 提供的依赖注入功能啦。

然后我们只要把 `PluginServiceProvider` 添加到 `config/app.php` 的服务提供者数组里去就可以加载插件机制的核心了：

```
'providers' => [
    // 其他 Provider ...
    App\Providers\PluginServiceProvider::class,
],
```

**注意：**请自行调整 `PluginServiceProvider` 的加载顺序，否则可能会造成一些依赖问题。

------------------

你觉得这样就差不多了？当然不可能 (　ﾟ 3ﾟ)

那么接下来将讲述如何让插件开发者能够在开发过程中爽到：

## 0x21 自动加载

既然不能像 Toby Zerner 那种猛男一样直接用 composer 管理插件，我们就必须自己为插件提供类的 **自动加载**。像 WordPress 那样要插件自己手动 `include` 类文件的方式早就过气了好吗，现在都啥年代了，自动加载才是王道 (ゝ∀･)☆

这也是为什么上面插件的目录结构中有 `src` 这个目录，以及 `package.json` 里有 `namespace` 这个字段的原因了 —— **插件 `src` 目录下的类将会被挂载至它定义的命令空间内**。

正如上面「目录结构」那里所演示的，我们可以直接使用 `SuperCache\Listener\CachePlayerJson` 这个类，并且该插件目录下的 `/src/Listener/CachePlayerJson.php` 文件将会被自动加载。

<script src="https://gist.github.com/prinsss/d7eb791b346e0521f838e269d8e87bd3.js"></script>

同样是在 `PluginServiceProvider` 这个类中，我们在加载插件的时候使用了 `$src_paths` 这个数组来储存各个插件的「命名空间」到「`src` 目录」的映射，并且通过 `spl_autoload_register` 这个内置函数注册了一个 autoload。这个 SPL 函数的文档在 [这里](http://php.net/manual/zh/function.spl-autoload-register.php)。

当然我们在这个新的 autoload 函数中判断了所要加载的类是否存在于插件们定义的 `namespace` 中，不然的话可能会和 composer 的自动加载冲突。

**需要注意的是**，这里我使用了 `PSR-0` 规范作为插件的自动加载规范~~（因为懒）~~，如果想要使用 `PSR-4` 的，可以参考 composer 的实现（笑）。

## 0x22 关于视图和本地化

Laravel 中插件系统的另一大问题是，如何让插件能够自由的显示插件中定义视图文件以及本地化的语言文件：直接调用 `view($key)` 这样是**只会**在主程序的视图目录下寻找的。

嘛，毕竟这些东西在文档上都是只字未提啊。所以我读了一遍 Laravel 的 `View` 和 `Translation`，发现了他们都提供了类似「命名空间」 的方法，代码分别在 [这里](https://laravel.com/api/5.3/Illuminate/View/FileViewFinder.html#method_addNamespace) 和 [这里](https://laravel.com/api/5.3/Illuminate/Translation/FileLoader.html#method_addNamespace)。

简单来说，他们都支持解析类似于 `SuperCache::config.fuck` 这样的带命名空间的键值，并且可以通过 `addNamespace` 方法给这些命名空间映射上真实目录。

那么问题就好办了：

```
$loader = $this->app->make('translation.loader');
// make view instead of view.finder since the finder is defined as not a singleton
$finder = $this->app->make('view');

foreach ($plugins->getPlugins() as $plugin) {
    // add paths of translation files for namespace hints
    $loader->addNamespace($plugin->getNameSpace(), $plugin->getPath()."/lang");
    // add paths of views
    $finder->addNamespace($plugin->getNameSpace(), $plugin->getPath()."/views");
}
```

在初始化插件的时候把他们的 `namespace` 同时注册给 Laravel 的视图组件和翻译组件即可，这样就可以用命名空间来访问插件 `views` 目录和 `lang` 目录下的内容了~

> 需要注意的是，我们这里并不是从服务容器中取出 `Illuminate\View\FileViewFinder` 实例，而是取出了 `Illuminate\View\Factory`。因为 `view.finder` 是通过 `$app->bind()` 绑定的，也就是每次服务容器中解析出的都是不同的 finder，这也就意味着我们添加的命名空间提示都会消失掉。而 factory 是通过 `$app->singleton()` 注册的，每次解析出来的都是同一个实例，所以不会有上述问题。这个地方坑了我蛮久的，所以这里提醒一下大家。

题外话，`Factory` 也有 `addNamespace` 这个方法，说明 Taylor Otwell 也是考虑的很周到啊，同时也说明了 Laravel 的文档是多么的菜 ⊂彡☆))д´)

完整的 `PluginServiceProvider` 可以参考 [这里](https://github.com/printempw/blessing-skin-server/blob/master/app/Providers/PluginServiceProvider.php)。

--------------

这样一来基本的插件系统就已经完工了，下一篇文章将会详细讲述该如何编写一个插件。

