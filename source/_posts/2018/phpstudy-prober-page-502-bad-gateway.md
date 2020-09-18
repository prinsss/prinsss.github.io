---
title: 'phpStudy 访问探针页面出现 502 Bad Gateway 的解决方法'
date: '2018-10-21 20:36:42'
updated: '2018-10-21 20:36:42'
categories: 技术
tags:
  - PHP
  - 记录
---

不要问我为什么要用 phpStudy，我也不想。

<!--more-->

## TL;DR 太长不看

Windows 环境下的 **PHP 7.2.1 / 7.1.13** 这两个版本有问题，在执行 `getenv()` 函数且第二个参数为 `false` 时，会造成 PHP FastCGI 进程 ( `php-cgi.exe` ) 崩溃。这是一个已知的 [BUG](https://bugs.php.net/bug.php?id=75794)，并且已经在 **2018-02-01** 发布的 **PHP 7.2.2** 与 **PHP 7.1.14** 中 [被修复](http://www.php.net/ChangeLog-7.php#7.2.2) 了。

然而遗憾的是，你现在（截至发稿日 2018-10-21）能在 phpStudy 官网下载到的最新的集成环境，其中的 PHP 版本依然停留在 7.2.1 与 7.1.13。惊不惊喜，意不意外？

![phpstudy-fake-version-7210](https://img.prin.studio/images/2018/10/21/phpstudy-fake-version-7210.png)

最绝的是，phpStudy 明明自带的是 **7.2.1** 版本的 PHP，却在界面上显示成了 **7.2.10**，是我瞎了还是你瞎了？补零也不是你这么补的啊兄弟……

修复方法也很简单，**升级 PHP 版本即可**。

下面开始讲废话。

## 0x01 问题描述

因为某些原因，我需要在 Windows 开发机上重新配置 PHP 开发环境（这个原因等下一篇博文再细说）。以前我一直用的是 [UPUPW 一键包](http://www.upupw.net/)，虽然它很好用，不过考虑到它的默认配置更适用于生产环境而非开发环境，而且相比起来 [phpStudy](http://phpstudy.php.cn/) 可以更方便地切换 PHP 版本与 Web 服务器（有时候测试兼容性要用到），所以最后我选择了使用 phpStudy 进行开发环境的配置。

然后坑就来了。

安装完 phpStudy 后，按照我个人的习惯先访问 PHP 探针页面，结果就被糊了一脸 **502 Bad Gateway**。懵了一阵子，开始找日志排查原因。先看 Nginx 的错误日志 `error.log`：

```text
2018/10/21 11:45:14 [error] 81019#14893: *10 WSARecv() failed (10054: An existing connection was forcibly closed by the remote host) while reading response header from upstream, client: 127.0.0.1, server: localhost, request: "GET /l.php HTTP/1.1", upstream: "fastcgi://127.0.0.1:9000", host: "localhost"
```

呃……远程主机强迫关闭了一个现有的连接？从日志来看，Nginx 是正常收到了请求，所以应该是 Nginx 通过 CGI 协议将请求交给 PHP 解析器处理时出现问题了，也就是监听在 `127.0.0.1:9000` 上的 PHP FastCGI 进程出了问题。（看不懂？那你应该去复习一下 [Nginx 与 PHP 交互的流程](https://segmentfault.com/q/1010000000256516/a-1020000000259560) 了。）

## 0x02 问题排查

接着去看一下 PHP 的错误日志。

phpStudy 中的 `php.ini` 默认设置了 `log_errors = On` 但是没有指定 `error_log` 的值，所以错误信息会被发送至 SAPI 错误记录器（前提是 `error_reporting` 设置正确）。在此例中，PHP 会将错误信息通过 CGI 发送至 Nginx，Nginx 捕获后会将错误记录至 `error.log`，就像这样：

```test
2018/10/21 11:45:14 [error] 81019#14893: *16 FastCGI sent in stderr: "PHP Fatal error:  Uncaught Error: Call to undefined function test() in E:\environment\bundle\php-study\PHPTutorial\WWW\l.php:183
Stack trace:
#0 {main}
  thrown in E:\environment\bundle\php-study\PHPTutorial\WWW\l.php on line 183" while reading response header from upstream, client: 127.0.0.1, server: localhost, request: "GET /l.php HTTP/1.1", upstream: "fastcgi://127.0.0.1:9000", host: "localhost"
```

然而我并没有在 `error.log` 中找到任何 PHP 的错误日志，也就是说……我不信邪，将 `error_log` 设置为文件日志后，却依然没有任何错误信息。草，没有错误日志你让我玩个屁啊！

好吧，这种情况下就只能靠万能的 Google 大老师了。

用关键词「Windows PHP 502 Bad Gateway」查了一下，似乎有说是 `php-cgi.exe` 进程开太少，造成并发阻塞的话会造成 502。我这才想起来，php-fpm 只适用于类 Unix 系统，Windows 版的 PHP 是没有自带 FastCGI 进程管理器的。打开任务管理器看了一下，果然，phpStudy 只开了一个 `php-cgi.exe`。

![phpstudy-single-php-cgi-process](https://img.prin.studio/images/2018/10/21/phpstudy-single-php-cgi-process.png)

看起来挺靠谱啊！难道就是这玩意造成的 502？

为了验证，我手动开启了几个 `php-cgi.exe` 进程，并修改 `nginx.conf` 如下：

```nginx
upstream php_fastcgi {
    server 127.0.0.1:9000;
    server 127.0.0.1:9001;
    server 127.0.0.1:9002;
}

server {
    # ...

    location ~ ^.+\.php {
        # 原来是 fastcgi_pass 127.0.0.1:9000;
        fastcgi_pass php_fastcgi;

        # ...
    }
}
```

重启 Nginx 后尝试访问之前出问题的页面，很遗憾地，依然是 502 Bad Gateway。不过，虽然问题并不是 `php-cgi.exe` 进程过少造成的，但是这次尝试并没有白费，我在这次测试中发现了一个现象：

**每次访问这个页面，`php-cgi.exe` 进程就会异常退出。**

因为 phpStudy 自带守护进程，就算 `php-cgi.exe` 崩溃了也会马上新开一个，所以我之前一直没有注意到。把所有配置还原成默认状态后观察进程，发现每次访问探针页面时，`php-cgi.exe` 进程都会死掉然后马上变成新的，然后 Nginx 那边就 502 了。至此，问题基本就能确定了：

**该页面中的某些 PHP 代码会造成 `php-cgi.exe` 进程崩溃。**

找到问题就好办了，用二分法最后定位到了 [探针](http://www.yahei.net/) 中造成问题的代码：

```php
<?php
echo getenv("HTTP_ACCEPT_LANGUAGE");
```

## 0x03 问题解决

Google 了一下「php getenv FastCGI crash」，找到不少类似的问题 ( [#1](https://stackoverflow.com/questions/48286208/getenvanystring-is-causing-an-internal-server-error), [#2](https://segmentfault.com/q/1010000015345101/), [#3](https://blog.csdn.net/smile12393/article/details/81132040) )，看来并不是个例。就像 TL;DR 中说的一样，这是只有运行在 FastCGI 模式下的 Windows 版 PHP 7.2.1 / 7.1.13 会遇到的一个 [BUG](https://bugs.php.net/bug.php?id=75794)，当 `getenv()` 的第二参数为 `false`（默认值）时就会造成 `php-cgi.exe` 崩溃。Apache 因为基本都是以模块的方式加载 PHP 的，一般不会受此影响，然而 phpStudy 中的 Apache 也是通过 FastCGI 加载 PHP 的，所以一样会中招。

解决方法也和上面说的一样：**升级 PHP 版本即可**。

排查这问题前前后后花了我将近一天的时间……因为很不爽所以写了这么一大段来抱怨，还请诸位见谅。另外，我已经受够这些 PHP 集成环境了，所以下一篇博文将是手动配置 WNMP 环境的教程。
