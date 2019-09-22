---
title: '手动修改 Laravel url() 函数生成的 URL 中的根地址'
date: '2016-12-17 21:45:42'
updated: '2016-12-17 21:45:42'
categories: 技术
tags:
  - Laravel
  - PHP
---

大家都晓得 Larevel 的一票帮助函数中有个 `url()`，可以通过给予的目录生成完整的 URL，是非常方便的一个函数：

```
// return: https://skin.dev/user/profile
url('user/profile')
```

但是这玩意生成的 URL 中要补完的部分是框架内部根据 Request 自动判断的，而自动判断出的东西有时候会出错（譬如在套了一层反向代理之类的情况下）。

文档上并没有提到我们要如何才能自定义它生成的 URL 中的根地址和协议头部分（`http(s)`），这就非常吃瘪了。那我们要咋办呢？

<!--more-->

首先我们来看看 `url()` 被定义的位置：

```
# File: src/Illuminate/Foundation/helpers.php

/**
 * Generate a url for the application.
 *
 * @param  string  $path
 * @param  mixed   $parameters
 * @param  bool    $secure
 * @return Illuminate\Contracts\Routing\UrlGenerator|string
 */
function url($path = null, $parameters = [], $secure = null)
{
    if (is_null($path)) {
        return app(UrlGenerator::class);
    }

    return app(UrlGenerator::class)->to($path, $parameters, $secure);
}
```

可以看到，它从 Laravel 的服务容器中解析出了一个 `Illuminate\Contracts\Routing\UrlGenerator`，并且把参数转交给了这个对象的 `to` 方法。

而这个 `UrlGenerator` 类是在 `src/Illuminate/Routing/RoutingServiceProvider.php` 这个服务提供者中被绑定到服务容器上去的：

```
/**
 * Register the URL generator service.
 *
 * @return void
 */
protected function registerUrlGenerator()
{
    $this->app['url'] = $this->app->share(function ($app) {
        // 略

        $url = new UrlGenerator(
            $routes, $app->rebinding(
                'request', $this->requestRebinder()
            )
        );

        return $url;
    });
}
```

这也就意味着我们可以随时通过 `url` 这个 `abstract` 来访问服务容器中的这个 `UrlGenerator`，并且修改它。

而且它也确实暴露了我们需要的方法：`forceSchema` 和 `forceRootUrl`。

----------------

修改 `url()` 函数生成的 URL 中的根地址的代码如下：

```
// 用它提供的方法检测 URL 是否有效
if (app('url')->isValidUrl($rootUrl)) {
    app('url')->forceRootUrl($rootUrl);
}

// 强制生成使用 HTTPS 协议的 URL
app('url')->forceSchema('https');
```

上面那些代码推荐放在自定义的 `ServiceProvider`，这样之后所有的 `url()` 函数生成的链接都会使用上面定义的根地址和协议了。

---------------------

所以说啊，要真正掌握 Laravel 的那些东西，光看文档还是不够的。而且 Laravel 的源码文档做的很不错，读起来很清晰，能学到不少东西。

以上。


