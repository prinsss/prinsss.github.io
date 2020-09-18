---
title: '使用 Laravel 的 RedirectResponse 重定向至任意 URL'
date: '2016-09-24 23:32:18'
updated: '2016-09-24 23:33:10'
categories: 技术
tags:
  - 记录
  - Laravel
  - PHP
---

Laravel 允许我们在控制器中返回一个 `Illuminate\Http\RedirectResponse` 的实例来执行重定向。根据文档，我们可以通过 `redirect()` 帮助函数或者 `Redirect` Facade 来生成实例，并且可以方便得重定向至命名路由、控制器行为等。

> 但如果我们想要重定向至自定义 URL 呢？

对于这样的需求，Laravel 官方的文档是**完全**没有提及的（至少到目前 5.3 是这样），所以估计很多人都是自己实现了一个使用 `header()` 或者 `<meta http-equiv='Refresh' content=''>` 的重定向函数（包括以前的我）。

<!--more-->

但是刚才在做 Blessing Skin Server 的国际化的时候，要求重定向至之前的页面。不得不说 Laravel 的 `back()` 函数有时候鸡肋得不行，因为它是通过在 `session` 里维护一个 `_previous` 数组来实现跳转到之前的页面的。

然而这个 `_previous` 会在每次 Laravel 收到请求的时候更新。没错，包括验证码，包括由 PHP 生成的预览图等等请求。这样的话访问一个带有上述请求的页面时，你是无法使用 `back()` 的，因为 Laravel 会把你重定向到那些 URL 上而不是用户看到的页面上。

好了回到正题。

这个回到上一个页面的功能也是可以用 `HTTP_REFERER` 这个 HTTP 头来实现的，并且里面存储了一个完整的 URL。**然而**，我们 Laravel 的文档里**并没有**写如何使用完整的 URL 生成重定向响应。

但是 Laravel 的 `Response` 可是基于 Symfony `HttpFoundation` 组件的，我可不信 SF 恁大个全栈框架会没有想到这种需求 (=ﾟωﾟ)= 所以自己动手丰衣足食，让我们来往下找找看看这些类有没有暴♂露出什么方法来让我们调用吧。

首先我们使用 `dd()` 看一下 `redirect('/')` 所返回的对象到底长什么样：

![](https://img.prin.studio/legacy/image.php?di=FV4B)

瞧我们发现了什么！一只野生的 `targetUrl` 属性！

好吧，看来 Laravel 就是靠着这个属性来执行具体的重定向的，那我们具体得怎么修改这个属性呢？

虽然查看 `Illuminate\Http\RedirectResponse` 的类定义后没有找到什么有用的方法，但是我们发现了它是继承自 `Symfony\Component\HttpFoundation\RedirectResponse` 的，我们继续往下挖：

```
<?php

namespace Symfony\Component\HttpFoundation;

/**
 * RedirectResponse represents an HTTP response doing a redirect.
 *
 * @author Fabien Potencier <fabien@symfony.com>
 */
class RedirectResponse extends Response
{
    protected $targetUrl;

    /* 省略 */

    public function setTargetUrl($url)
    {
        if (empty($url)) {
            throw new \InvalidArgumentException('Cannot redirect to an empty URL.');
        }
        // 耶！
        $this->targetUrl = $url;

        $this->setContent(/* Content */);

        $this->headers->set('Location', $url);

        return $this;
    }
}
```

可以看到 Symfony 的 `RedirectResponse` 类给我们暴露出了一个 `setTargetUrl` 方法，那么一切都好办了~

现在，我们只需要在 Laravel 控制器中像这样写：

```php
return redirect('/')->setTargetUrl($_SERVER['HTTP_REFERER'])->withCookie('locale', $lang);
```

即可返回一个带着自定义 URL 的 `Illuminate\Http\RedirectResponse` 实例，并且 Laravel 也会根据这个乖乖的帮我们重定向到指定页面去。

**所以说文档有时候也是不全面的，如果真碰到啥奇怪的问题还是要自己去看代码呀**（想起了我为了在 Laravel 外调用它的功能而到处翻源码并手动注册了一堆 `Service Provider` 的惨痛经历 ﾟ(つд`ﾟ)


