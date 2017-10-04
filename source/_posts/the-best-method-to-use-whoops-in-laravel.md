---
title: 'Laravel 使用 whoops 处理错误最优雅的姿势'
date: '2016-12-22 23:00:45'
updated: '2017-06-11 11:13:18'
categories: 技术
tags:
  - Laravel
  - PHP
---

[filp/whoops](https://github.com/filp/whoops) 这个错误处理类库有什么好处我这里就不赘述了，谁用谁知道。

Laravel 在 4.x 时代是有集成了 whoops 的，但是在 5.x 去掉了。不过作为一个 out-of-the-box 的错误处理类库，我们依然可以很方便地将 whoops 带回 Laravel 中。

网上有很多文章都讲述了 Laravel 使用 whoops 的方法，但总有些小问题（像是代码太丑了啊，代码太丑了啊之类的）。其中我认为最优雅的实现是这篇文章所描述的：[Bringing Whoops Back to Laravel 5](https://mattstauffer.co/blog/bringing-whoops-back-to-laravel-5)，我下面的也是基于他给出的代码修改的。

<!--more-->

-------------

安装 whoops 之类的步骤我这里就不说了，这些在它的 README 上都有。安装完后打开 `app/Exceptions/Handler.php` 这个文件，进行如下修改：

```
/**
 * Render an exception into an HTTP response.
 *
 * @param  \Illuminate\Http\Request  $request
 * @param  \Exception  $e
 * @return \Illuminate\Http\Response
 */
public function render($request, Exception $e)
{
    if ($e instanceof \Illuminate\Foundation\Validation\ValidationException) {
        // quick fix for returning 422
        // @see https://prinzeugen.net/custom-responses-of-laravel-validations/
        return $e->getResponse()->setStatusCode(200);
    }

    foreach ($this->dontReport as $type) {
        if ($e instanceof $type) {
            return parent::render($request, $e);
        } else {
            // 当不处于 DEBUG 模式时隐藏错误的详细信息，防止敏感信息泄露
            if (config('app.debug')) {
                return $this->renderExceptionWithWhoops($e);
            } else {
                // 这里我们调用下面定义的方法，给用户显示一个「哎呀，出错啦」的友好页面
                // 如果你想继续使用 Laravel 默认的那个只有一句话的错误页
                // 就把下面这行改成 return parent::render($request, $e);
                return $this->renderExceptionInBrief($e);
            }
        }
    }
}

/**
 * Render an exception using Whoops.
 *
 * @param  \Exception $e
 * @return \Illuminate\Http\Response
 */
protected function renderExceptionWithWhoops(Exception $e)
{
    $whoops = new \Whoops\Run;

    // 只有在 GET 请求出错时渲染 PrettyPage，其余请求时直接渲染文本
    // 你也不想在 AJAX 请求的错误处理函数中看到一个 web 页面吧
    $handler = ($_SERVER['REQUEST_METHOD'] == "GET") ?
                    new \Whoops\Handler\PrettyPageHandler : new \Whoops\Handler\PlainTextHandler;
    $whoops->pushHandler($handler);

    return new \Illuminate\Http\Response(
        $whoops->handleException($e),
        $e->getStatusCode(),
        $e->getHeaders()
    );
}

/**
 * Render an exception in a short word.
 *
 * @param  \Exception $e
 * @return \Illuminate\Http\Response
 */
protected function renderExceptionInBrief(Exception $e)
{
    // 这里请自定义要返回的视图，其中不包含错误的详细信息
    return response()->view('errors.brief');
}
```

------------

可以看到我们新添加了 `renderExceptionWithWhoops` 和 `renderExceptionInBrief` 两个方法，分别适用于 `APP_DEBUG` 开和关的情况。

你问我为啥要覆盖 Laravel 在 `APP_DEBUG` 为关时的默认错误页？

![DEFAULT](https://img.blessing.studio/images/2017/06/11/dcd061dea8af4e92a25f6f759997867d.png)

你要是觉得这个默认的页面好看那我也管不着咯~ 反正我是修改成下面这样了：

![CUSTOM ERROR HANDLER](https://img.blessing.studio/images/2017/06/11/e043fab0f154cf59e6d5381f2401c6c1.png)

至于为什么要在当前为 POST 请求时使用 `PlainTextHandler` 渲染纯文本的堆栈信息：

![AJAX](https://img.blessing.studio/images/2017/06/11/48e75f7e2cfcec5ec7bd26084fd8ea93.png)

如果你渲染的是页面的话你就会在这个 Modal 里看到你的窗口了（笑）。当然，如果你没有做这样的 Ajax 错误处理的话也可以忽略这个。

那段修改 `ValidationException` 响应状态码为 `200` 的也是为了 Ajax，详情可以查看我之前写的博文：[自定义 Laravel Validator 所返回的响应](https://prinzeugen.net/custom-responses-of-laravel-validations/)

最后效果如下：

![whoops](https://img.blessing.studio/images/2017/06/11/6892b433d0e0b08d24a8ec9569163462.png)

以上。
