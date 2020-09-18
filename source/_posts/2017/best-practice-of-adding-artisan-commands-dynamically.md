---
title: Laravel 动态添加 Artisan 命令的最佳实践
date: 2017-07-30 18:45:50
updated: 2017-07-30 18:45:50
categories: 技术
tags:
  - Laravel
  - PHP

---

虽然 Laravel 官方文档提供的添加 Artisan Command 的方法是直接修改 `app/Console/Kernel.php` 文件并在 `$commands` 属性中注册要添加的 Artisan 命名的类名（Laravel 服务容器会自动解析），但是，如果我们出现需要「动态（运行时）添加 Artisan 命令」的需求的话，就会很容易吃瘪。因为，Laravel 的文档（当然，我说的是官网上的）几乎没有提到任何关于这方面的内容。

<!--more-->

这也是我为什么总是吐槽 Laravel 文档有些地方很烂的原因 —— 很多时候你为了实现一个文档里没提到的功能，需要去翻半天 Laravel 的框架源码才能找到解决方法（我博客的 [Laravel 标签](https://blessing.studio/tag/Laravel/) 下已经有不少这样的踩坑文了）。虽然 Laravel 框架的源码很优雅，看着也不会难受，但是在一堆文件中跳来跳去寻找逻辑浪费脑细胞的行为还是能省则省吧 :(

这次要实现的功能是在运行时动态加载自定义的 Artisan Command（更详细一些的需求就是在皮肤站的一个插件中注册 Artisan 命令，Laravel 插件系统的实现可以参考我之前的 [另一篇文章](https://blessing.studio/laravel-plugin-system-1/)）。

## TL;DR 太长不看

总之先上干货，毕竟不是所有人都喜欢听我废话一大堆后才拿到解决方案的。

Laravel 5.3 及以上：

```php
Artisan::starting(function ($artisan) {
    // 传入类名字符串即可，会被服务容器自动解析
    $artisan->resolve('Example\FooCommand');
    // 批量添加
    $artisan->resolveCommands([
        'Example\FuckCommand',
        'Example\ShitCommand'
    ]);
    // 参数必须为 Symfony\Component\Console\Command\Command 的实例
    // 继承自 Illuminate\Console\Command 的类实例也可以
    $artisan->add($command);
});
```

Laravel 5.2：

```php
Event::listen('Illuminate\Console\Events\ArtisanStarting', function ($event) {
    // 其他用法同上
    $event->artisan->resolve('Example\BarCommand');
});
```

Laravel 5.1：

```php
Event::listen('artisan.start', function ($event) {
    // 其他用法同上
    $event->artisan->resolve('Example\WtfCommand');
});
```

接下来就是我摸索时尝试的步骤，写下来权当记录~~水博文~~，发了发牢骚，有兴趣的就继续看下去吧。

## 0x01 初步尝试

既然 Laravel 最常见的注册 Artisan 命令的方式是修改 `APP\Console\Kernel` 类中的 `$commands`，那么一般正常人都会从这边开始下手。可以看到，这个类是继承自 `Illuminate\Foundation\Console\Kernel` 类并覆写了 `$commands` 属性。让我们稍微看一下这个 `$commands` 属性用在哪了：

```php
/**
 * Get the Artisan application instance.
 *
 * @return \Illuminate\Console\Application
 */
protected function getArtisan()
{
    if (is_null($this->artisan)) {
        return $this->artisan = (new Artisan($this->app, $this->events, $this->app->version()))
                            ->resolveCommands($this->commands);
    }

    return $this->artisan;
}
```

可以看到，这个方法用单例模式实例化了一个 Artisan（`Artisan` 是 `Illuminate\Console\Application` 的别名），其中最重要的是调用了 `Illuminate\Console\Application::resolveCommands` 这个方法，并且将那个注册了自定义 Artisan 命令的属性给传了进去。我们跳转到那个 `resolveCommands` 方法看一看……

```php
/**
 * Add a command, resolving through the application.
 *
 * @param  string  $command
 * @return \Symfony\Component\Console\Command\Command
 */
public function resolve($command)
{
    return $this->add($this->laravel->make($command));
}

/**
 * Resolve an array of commands through the application.
 *
 * @param  array|mixed  $commands
 * @return $this
 */
public function resolveCommands($commands)
{
    $commands = is_array($commands) ? $commands : func_get_args();

    foreach ($commands as $command) {
        $this->resolve($command);
    }

    return $this;
}
```

代码条理很清晰，挨个儿把那些 `$commands` 中的元素给丢进 Laravel 服务容器里实例化之后，调用父类方法 `Symfony\Component\Console\Application::add` （是的，Laravel 用了很多很多 Symfony 的组件）添加到自身实例中，持引用以供之后的调用所需。

继续翻看 `Illuminate\Foundation\Console\Kernel` 的源码，可以看到 Laravel 贴心地开放了一个 `registerCommand` 方法：

```php
/**
 * Register the given command with the console application.
 *
 * @param  \Symfony\Component\Console\Command\Command  $command
 * @return void
 */
public function registerCommand($command)
{
    $this->getArtisan()->add($command);
}
```

那么我们要做的就是，在运行时中拿到 `Kernel` 的实例，并且通过调用 `registerCommand` 方法把我们的自定义 Artisan 命令也给加进去。那么我们要怎样才能拿到这个实例呢？

相信对 Laravel 有所了解的各位都会想到 —— 服务容器。

通过查阅 Laravel 命令行入口（根目录下的 `artisan` 文件）源码可以知道，Laravel 就是使用服务容器来实例化 `Kernel` 的：

```php
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
```

如果你有心的话，会发现 Laravel 框架的 Web 入口文件（`public/index.php`）和命令行入口文件中实例化 `Kernel` 的语句都是一样的，那么为什么通过 Web 访问时解析出来的是 `App\Http\Kernel` 的实例而通过命令行访问时解析出来的就是 `App\Console\Kernel` 的实例了呢？

这里就涉及 Laravel 服务容器的一个强大的核心功能 —— 绑定接口至实现。因为这些实例都实现了相同的接口，所以我们可以使用相同的代码并且很方便地更换接口后的具体实现，这也是使用 IoC 容器的好处之一，有兴趣的多去了解了解吧 :)

闲话休提，那么我们只要通过服务容器就可以拿到 `Kernel` 实例了（当然，如果你愿意，你也可以直接通过 `$GLOBAL['kernel']` 来访问全局作用域下定义的那个 `$kernel` 变量，效果都是一样的，但是太 tmd lowb 了，所以我不愿意用），看起来已经离成功了一大半呢！

```php
$kernel = app('Illuminate\Contracts\Console\Kernel');
// 因为 registerCommand 方法只接受 Symfony\Component\Console\Command\Command 的实例作为参数
$kernel->registerCommand(app('Example\FooCommand'));
```

然后我们执行一下 `php artisan list`，就能看到我们的命令已经出现啦：

```
Laravel Framework version 5.2.45

Usage:
  command [options] [arguments]

Available commands:
  help           Displays help for a command
  list           Lists commands
  foo            Example command
```

但是等等……Laravel 自带的那些 `make`、`migrate` 等命令哪里去了？我最开始出现这个问题的时候还以为是我太早把 `Kernel` 解析出来了，后来直接使用 `$GLOBALS['kernel']` 也是一样的问题时才认识到问题另有原因。仔细阅读源码后发现 Artisan 命令行在调用（`handle`、`call` 等方法）之前都会调用这样一个方法：

```php
$this->bootstrap();
```

<style>.post-content table, .post-content code { word-wrap: break-word; }</style>

通过阅读源码可以知道这个 `bootstrap` 方法就是用来加载 Laravel 框架的基本组件的，包括 `Illuminate\Foundation\Providers\ArtisanServiceProvider` 这个服务提供者中提供的所有框架内置 Artisan 命令。好在这个方法是 public 的，所以我们只要在 `registerCommand` 之前调用一下这个方法就可以啦：

```php
$kernel = app('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();
$kernel->registerCommand(app('Example\FooCommand'));
```

如果你愿意，你甚至还可以直接使用 `Artisan` 这个 `Facade`，因为它就是指向 `Illuminate\Contracts\Console\Kernel` 的：

```php
Artisan::bootstrap();
Artisan::registerCommand(app('InsaneProfileCache\Commands\Clean'));
```

结果如下：

![Screenshot](https://i.loli.net/2017/07/30/597df1d0e5231.png)

## 0x02 继续尝试

虽然这样确实能够实现我们的需求，但是我觉得这样不行（话说我都不晓得嘻哈梗怎么突然就流行起来了，虽然确实蛮有意思的啦）。

![我觉得不行](https://img.prin.studio/images/2017/07/30/934f97e408371023.png)

又要自己取出 `Kernel` 实例，又要自己调用 `bootstrap` 方法，调用 `registerCommand` 方法之前还有自己先把 Command 实例化……这么繁琐，肯定不是运行时添加 Artisan 命令的最佳实践，所以我决定继续寻找更优解。

虽然我们上面用的方法是取出 `Kernel` 实例并进行操作的，但是其实该方法里的操作也是基于 `getArtisan` 所获取的  `Illuminate\Console\Application` （👈这玩意在 Laravel 源码里经常被 as 为 `Artisan`）实例进行的。可惜的是这个方法是 `protected` 的，我们无法直接调用它，所以我们还是先去看这个类的源码吧：

```php
/**
 * Create a new Artisan console application.
 *
 * @param  \Illuminate\Contracts\Container\Container  $laravel
 * @param  \Illuminate\Contracts\Events\Dispatcher  $events
 * @param  string  $version
 * @return void
 */
public function __construct(Container $laravel, Dispatcher $events, $version)
{
    parent::__construct('Laravel Framework', $version);

    $this->laravel = $laravel;
    $this->setAutoExit(false);
    $this->setCatchExceptions(false);

    $events->fire(new Events\ArtisanStarting($this));
}
```

瞧我发现了什么？Artisan 在实例化之后会触发一个 `Illuminate\Console\Events\ArtisanStarting` 事件，并且把自身实例给传递过去。那么我们要做的就很简单了：监听该事件，拿到 Artisan 实例，调用 `resolve` 或 `resolveCommands` 方法来注册我们的 Artisan 命令即可。

具体的方法在最上面给出了，我这里就不多说了。另外需要注意的是，Laravel 5.1 版本并没有 `ArtisanStarting` 这个事件，而是 `artisan.start`，不过原理都是一样的：

```php
$events->fire('artisan.start', [$this]);
```

另外，在 Laravel 5.3 及以上版本中，Artisan 还贴心地提供了 `Artisan::starting` 这个方法，和监听事件的效果差不多，不过是直接修改实例的 `$bootstrappers` 属性的，传递一个闭包进去即可，示例代码见最上方。

## 0x03 一些牢骚

虽然只要看源码就能知道，Laravel 框架很多地方都预留了非常多的接口，让我们可以方便优雅地实现很多自定义功能，这也是我为什么喜欢这个框架的原因之一。

但是……但是，你的文档就不能写好一点吗！哪怕提一下这些 API 也好啊！
