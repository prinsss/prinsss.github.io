---
title: '为 Blade 模板引擎添加新文件扩展名'
date: '2016-08-27 21:15:06'
updated: '2016-08-27 21:16:08'
categories: 技术
tags:
  - Laravel
  - PHP
---

因为一些原因，我准备把 Blessing Skin 的框架换成 Laravel 了（之前是自己搭建的一个框架），但是在模板迁移的时候遇到了一点问题。

之前我是使用的 [XiaoLer/blade](https://github.com/XiaoLer/blade) 这个从 Laravel 中抽离出来的 Blade 模板引擎，并且自定义为使用 `.tpl` 文件后缀。你问为啥不用默认的 `.blade.php` 而是用这个 Smarty 的模板扩展名？能有啥，好看呗 :-D

不过之前我是直接调用 `FileViewFinder` 类的 `addExtension` 方法来添加扩展名的，但是在 Laravel 里就不能这样了。你总不能在 `Illuminate\View` 加几句话吧？

去 Google 搜索了下，没发现有可以很方便使用的方法（当然是搜的鹰文，说不定是我姿势不对），就只好自己找了。

首先先从 `View` Facade 入手，可以看到它是从服务容器中解析出了 `view` 这个绑定。继续往下找，打开 `Illuminate\View\ViewServiceProvider`，看看 View 的服务提供者到底是把啥给绑定到 `view` 上去了：

<!--more-->

```php
public function registerFactory()
{
    $this->app->singleton('view', function ($app) {
        $resolver = $app['view.engine.resolver'];

        $finder = $app['view.finder'];

        $env = new Factory($resolver, $finder, $app['events']);

        $env->setContainer($app);

        $env->share('app', $app);

        return $env;
    });
}
```

嗯嗯，我们可以看到这是绑定了个 `Illuminate\View\Factory` 实例，于是我们继续往下找，看看这个工厂类都有啥方法：

```
/**
 * Register a valid view extension and its engine.
 *
 * @param  string    $extension
 * @param  string    $engine
 * @param  \Closure  $resolver
 * @return void
 */
public function addExtension($extension, $engine, $resolver = null)
{
    $this->finder->addExtension($extension);

    if (isset($resolver)) {
        $this->engines->register($engine, $resolver);
    }

    unset($this->extensions[$extension]);

    $this->extensions = array_merge([$extension => $engine], $this->extensions);
}
```

哦哦~ 果然我们在工厂类里找到了一个 `FileViewFinder::addExtension` 的封装。然而正当我欣喜地准备调用的时候，却发现这个方法有个神秘的 `$engine` 参数。

诶？WTF？这尼玛是啥？( ・_ゝ・)

看了看文档也没看出个所以然来，就只好从方法的具体代码里找找蛛丝马迹了:

```
$this->extensions = array_merge([$extension => $engine], $this->extensions);
```

哦呀？这一行在 `$this->extensions` 里加上了一个 `[$extension => $engine]` 的数组，那么只要我们看看这个数组原先的定义，就可以知道这个 `$engine` 是个啥子了：

```
/**
 * The extension to engine bindings.
 *
 * @var array
 */
protected $extensions = ['blade.php' => 'blade', 'php' => 'php'];
```

啊哈，原来这个 `$engine` 指的是解析 `$extension` 所使用的引擎！这下一切都水落石出了，如果你在传入 `.tpl` 的同时传入一个 `blade` 的引擎，就是告诉 Blade，要把以 `.tpl` 为扩展名的文件用 Blade 模板引擎来解析。

这下一切都简单了，我们只需要在 `AppServiceProvider` （或者其他适当的服务提供者）里通过调用 `View` Facade 就可以非常方便快捷地添加扩展名了：

```
View::addExtension('tpl', 'blade');
```

谨以此文记录，愿能帮到后来人 (*´∀`)

