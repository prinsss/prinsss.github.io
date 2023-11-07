---
title: '让 Lumen 的 dd() 与 dump() 函数输出更漂亮'
date: '2017-06-11 09:57:21'
updated: '2017-06-11 09:57:21'
categories: 技术
tags:
  - Laravel
  - PHP
---

做开发的，免不了要和调试打交道。单说 PHP，有的人直接 `echo`，有的人用 `print_r()`，有的人用 `var_dump()`，还有的人直接上 Xdebug，用啥的都有。

如果你用过 Laravel，那你应该知道 Laravel 内置了几个很方便的帮助函数（Helper）—— `dd()` 和 `dump()`。这两个函数都能够输出变量的值，不同的是 `dd()` 在输出变量值后会停止脚本的执行，而 `dump()` 不会。它们的使用方法可参照官方文档：[Helpers - Laravel Documentation](https://laravel.com/docs/5.4/helpers#method-dd)。

<!--more-->

![Laravel dd() 输出示例](https://img.prin.studio/images/2017/06/11/snipaste_20170610_214238.png)

什么？哦，上帝！真是见鬼！怎么会有人在 Laravel 中还在用 `echo` + `die()`？好家伙，我敢打赌，他一定没有好好看文档，我向圣母玛利亚保证。如果让我看到这群愚蠢的土拨鼠，看在上帝的份上，我会用靴子狠狠地踢他们的屁股，我发誓我绝对会。

但是如果你在 Lumen（一个为速度而生的类 Laravel 微框架）中也想使用这些帮助函数的话，你会发现 `dump()` 无法使用了（报错 `Call to undefined function`），而且 `dd()` 的结果会变成这样瞎眼的输出：

![Lumen dd() 输出示例](https://img.prin.studio/images/2017/06/11/snipaste_20170610_214933.png)

淦！这不就是 `var_dump()` 吗？为毛在 Laravel 上输出那么漂亮，在 Lumen 上就无法使用了呢？

正是因为 Lumen 是个微框架。

作为一个为速度而生的微框架（全栈框架 Laravel 的性能问题一直是为人所诟病的），它把能精简的东西都尽量精简了。Laravel 那个漂亮的 `dd()` 输出实际上是依赖于 Symfony 的 [`VarDumper`](http://symfony.com/doc/current/components/var_dumper.html) 组件，Laravel 默认预装了该组件，而 Lumen 没有。

**那么解决方法就很简单了，只需重新安装该组件即可**：

```
$ composer require symfony/var-dumper
```

安装完成后就可以在 Lumen 中看到和 Laravel 一样的调试输出，而且 `dump()` 函数也可以使用了。

![](https://img.prin.studio/images/2017/06/11/snipaste_20170611_093434.png)

顺带一提，有人觉得这样的变量内容输出没有 `var_dump()` 好，原因是要不停地点展开很麻烦。其实只要按住 `Ctrl` 再点击箭头，就可以快速展开所有的子项目了。

-----------

单说解决方法也有点太没意思，顺便也说说为啥安装上 `symfony/var-dumper` 组件后 `dd()` 的输出就会变得好看吧。

首先我们定位到 `dd()` 函数的声明位置：`vendor/illuminate/support/helpers.php`（其他大部分的帮助函数都在这里，和 Laravel 一样），可以看到该函数具体实现是这样的：

```
if (! function_exists('dd')) {
    /**
     * Dump the passed variables and end the script.
     *
     * @param  mixed
     * @return void
     */
    function dd(...$args)
    {
        foreach ($args as $x) {
            (new Dumper)->dump($x);
        }

        die(1);
    }
}
```

可以看到这里用了 PHP5.6+ 的变长参数语法 `...`，函数内部遍历参数列表并把它们交给 `Dumper` 处理，最后用 `die(1)` 结束整个脚本的运行。

那么这个 `Dumper` 是个啥呢？我们继续定位，可以发现它的完整类名为 `Illuminate\Support\Debug\Dumper`，而上面所使用的 `dump()` 方法具体实现如下（话说这函数的 DocBlock 还蛮有意思的，优雅地导出一个值）：

```
/**
 * Dump a value with elegance.
 *
 * @param  mixed  $value
 * @return void
 */
public function dump($value)
{
    if (class_exists(CliDumper::class)) {
        $dumper = 'cli' === PHP_SAPI ? new CliDumper : new HtmlDumper;

        $dumper->dump((new VarCloner)->cloneVar($value));
    } else {
        var_dump($value);
    }
}
```

可以看到，`dd()` 函数是根据 `Symfony\Component\VarDumper\Dumper\CliDumper` 这个类是否存在来决定是用 `symfony/var-dumper` 组件导出漂亮的结果还是直接用内置函数 `var_dump()` 来导出。

所以在我们通过 composer 安装 `symfony/var-dumper` 组件后，`dd()` 函数就会检测并自动使用该组件替换原生函数以输出更漂亮的结果。

以上。



