---
title: '自定义 Laravel Validator 所返回的响应'
date: '2016-09-10 21:08:08'
updated: '2016-09-10 21:12:33'
categories: 技术
tags:
  - Laravel
  - PHP
  - 踩坑
---

不得不说 Laravel 的 [Validation](http://laravel-china.org/docs/5.1/validation) 是极好的，非常易于使用，麻麻再也不用担心我要写一大堆验证啦 ~(　^ω^)

但是这个 Validator 有一个神秘的地方 ( -д-)，正如官方文档所说，它会自动判断当前请求是否为 Ajax 发送的，如果是，则在验证失败的时候返回一个 `JsonResponse` 响应而不是 `RedirectResponse` 响应。

> **但是**，这个 JSON 响应的状态码，是 422。

WTF！坑爹呢这是！要知道 422 这个状态码是通不过 `jQuery.ajax.success` 的啊！

![](https://img.prin.studio/legacy/image.php?di=WYT3)

在网上找了一圈，愣是没找着什么好一点的解决方法（全是叫你在 `$.ajax.failed` 里处理错误的）。

<!--more-->

没办法，自己动手丰衣足食，总之先看看文档：[自定义闪存的错误消息格式](http://laravel-china.org/docs/5.1/validation#自定义闪存的错误消息格式)

哦哦，看来我们可以在控制器基类中自定义错误的格式，于是我试着在 `formatValidationErrors` 方法中返回了一个状态码为 200 的 `Illuminate\Http\JsonResponse`。但是这样是行不通的，这个方法要求我们要返回一个数组，所以我们就不能使用这种小 trick 了（当然如果你愿意直接在这个方法里输出 JSON 文本然后 exit 的话也没事）。

既然这里没办法了，我们就得从 ExceptionHandler 下手了。众所周知 Laravel 的验证器会抛出一个 `ValidationException` 异常，此异常在被捕获后会被 Laravel 的基异常处理器给渲染成 Http 响应（判断是否为 Ajax 请求也是在这里做的）。

找到 Laravel 的基异常处理器 `Illuminate\Foundation\Exceptions\Handler` 后，我们可以发现对于 `ValidationException` 这类的异常，Laravel 是直接从里面取出响应返回回去的。也就是说，具体的异常渲染是在 `ValidationException` 对象内完成的：

```
/**
 * Render an exception into a response.
 *
 * @param  \Illuminate\Http\Request  $request
 * @param  \Exception  $e
 * @return \Symfony\Component\HttpFoundation\Response
 */
public function render($request, Exception $e)
{
    if ($e instanceof HttpResponseException) {
        return $e->getResponse();
    } elseif ($e instanceof ModelNotFoundException) {
        $e = new NotFoundHttpException($e->getMessage(), $e);
    } elseif ($e instanceof AuthenticationException) {
        return $this->unauthenticated($request, $e);
    } elseif ($e instanceof AuthorizationException) {
        $e = new HttpException(403, $e->getMessage());
    } elseif ($e instanceof ValidationException && $e->getResponse()) {
        # 注意这里
        return $e->getResponse();
    }

    if ($this->isHttpException($e)) {
        return $this->toIlluminateResponse($this->renderHttpException($e), $e);
    } else {
        return $this->toIlluminateResponse($this->convertExceptionToResponse($e), $e);
    }
}
```

~~一颗赛艇！~~ 既然看到了希望，我们就继续找下去。不过既然知道了 Laravel 原本的异常处理器是直接取出响应就输出出去了，那我们就先看看这个取出来的 Response 到底是个啥：

```
class Handler extends ExceptionHandler
{
    public function render($request, Exception $e)
    {
        if ($e instanceof ValidationException) {
            dd($e->getResponse());
        }
    }
}
```

这里我们用到了 Laravel 一票帮助函数中非常好用的一个函数 —— `dd()`，这个函数的功能差不多就是一个漂亮的 `var_dump()` 加上 `exit()`，用来调试再方便不过了：

![](https://img.prin.studio/legacy/image.php?di=7RB6)

哦？这个方法得到的竟然是一个标准的 `JsonResponse` 响应！

既然是这样，那我们就可以很方便的使用它的 `setStatusCode` 方法来设置其响应码了。这个方法是继承自 `Symfony\Component\HttpFoundation\Response` 的，有兴趣的可以去读一读。

综上所述，最后我们所需要做的就只是在 `app/Exceptions/Handler.php` 的 `handle` 方法中添加一个对于 `ValidationException` 的判断：

```
if ($e instanceof ValidationException) {
    return $e->getResponse()->setStatusCode(200);
}
```

结果如下：

![](https://img.prin.studio/legacy/image.php?di=XQY9)

谨以此文记录，愿能帮到后来人~ (ゝ∀･)

~~当然你如果对于代码的整洁没那么多要求的话也用不着用这种方法就是了~~
