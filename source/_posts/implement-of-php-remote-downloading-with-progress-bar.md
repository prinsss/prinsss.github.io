---
title: 'PHP 远程文件下载的进度条实现'
date: '2016-11-26 18:25:00'
updated: '2016-11-26 20:52:25'
categories: 技术
tags:
  - PHP
---

PHP 实现远程下载文件到服务端并不是什么新鲜玩意，用 `cURL`、`file_get_contents`、`fopen` 等都能够轻易实现。

但是这几种常规的方法都是在一个线程内下载文件，等文件下载完毕以后才能返回 HTTP 响应。所造成的结果就是用户在页面上点击「下载到服务器」按钮后，会看到空白页和加载的小菊花转啊转，转好久之后才出现「下载成功」的页面。

当然，我上面所举例的情况是只使用纯粹的表单 POST 发送请求的情况。现在的话就算再不济也一般会使用 `ajax` 发送请求，然后在前台放个加载动画，等收到下载成功的回应之后再进行下一步操作。

**但是！**即使是去掉了恶心的且需要等待的空白页，这样做还是对用户体验有不好的影响。没有具体的下载进度，只有一个一直转呀转的菊花图，估计挺多用户都无法坐和放宽吧~~（至少对于我来说是这样的）~~

而我一个 PHP 项目的一键更新系统正好需要重构，遂研究了如何在 PHP 作为后端时显示远程文件下载进度条，并捣鼓出了个像样的解决方案，在这里分享一下。

<!--more-->

------------------

## 0x01 原理

也许你在搜索「PHP 下载 进度条」的时候会看到有些文章使用 PHP 的输出控制函数（`flush` 之类的）控制缓冲区来实现进度条。但是——

**那都是狗屁！**

没有人可以保证用户的 PHP 关闭了默认开启的 `output buffering`，也无法保证 浏览器 / Web Server 不对脚本输出进行缓存。如果上述两者其中之一处于开启状态的话，你就会喜闻乐见的发现本应该慢慢增长的进度条会在等待完漫长的 xx 秒后一下子蹦到 100%_（因为控制前端进度条长度的语句被缓存起来，在脚本执行结束后一并发送了，而不是一块一块地传给浏览器）_。

关于上面缓冲区控制的进度条就是辣鸡的更多讨论可以查看文章底部的参考链接。

闲话休提。那么我们该如何实现下载进度条的更新呢？

首先通过后端一点点输出控制进度条语句的方案已经 PASS 了，那么我们很自然的就会想到——

**在前端设置一个定时器，Ajax 轮循下载进度并更新页面上的进度条。**

## 0x02 概述

知道了原理之后，我们先来考虑下整体的架构与步骤。

1. 用户点击「下载」按钮，前端展示出进度条，并 ajax 发送 `prepare-download` 的请求；
2. 后端收到请求，进行远程下载的准备工作 —— 准备好远程文件链接、临时文件存放位置以及**文件的大小**，并返回给浏览器；
3. 前端拿到文件大小等信息后，发送真正的 `start-download` 请求（这个请求耗时可能会很长），并**启动轮循的计时器**；
4. 计时器启动后，每隔一段时间发送 `get-file-size` 请求，获取当前临时文件的大小，**计算进度**后更新进度条；
5. 直到下载完成。

下面给出前后端代码的实例。

## 0x03 后端

代码照例放在 Gist 上，加载不出自行解决：

{% lazy_gist 9f551b74c86990f8ce62550c2abb2ef3 %}

示例代码使用了 `?action=xxx` 的 Query String 形式来区分不同的指令，这些请酌情修改。和我业务逻辑有关的一些关键函数都被我替换为浅显易懂的名字（譬如 `get_remote_file_url`）了，需要你自己去替换实现。

## 0x04 前端

{% lazy_gist 8500162cade21ed7eb720c9ecf59b86b %}

## 0x05 效果 & 总结

![效果图](https://img.prinzeugen.net/image.php?di=8CFM)

实例代码用了 `fopen` 和循环 `fwrite` 写入一个 chunk 的数据到临时文件，这是借鉴了 KODExplorer 远程下载的函数，在此致谢。另外也有通过 `curl_setopt($ch, CURLOPT_FILE, $fp);` 给 cURL 设置一个文件句柄的方法，但是我没有测试成功，希望各位也能试一试。

以上。

### 参考链接

- [PHP: flush - Manual](http://php.net/manual/zh/function.flush.php) 的「说明」部分
- [PHP progress bar - PHP Coding Help - PHP Freaks](https://forums.phpfreaks.com/topic/201119-php-progress-bar/)
- [What is output buffering? - Stack Overflow](http://stackoverflow.com/questions/2832010/what-is-output-buffering)
- [KODExplorer/file.function.php at master
](https://github.com/kalcaddle/KODExplorer/blob/master/lib/function/file.function.php#L697)


