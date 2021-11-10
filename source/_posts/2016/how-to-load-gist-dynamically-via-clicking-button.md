---
title: '实现点击按钮加载 Gist 代码块'
date: '2016-11-01 16:38:38'
updated: '2016-11-01 16:39:32'
categories: 技术
tags:
  - 分享
  - JavaScript
---

GitHub Gist 应该也是很多人都在用的功能了，我也喜欢把一些大段的代码块贴上去而不是直接写在博文里。

但是 Gist 的 embed js 是在页面加载的时候就直接开始加载了的，所以或多或少还是对网页的性能有所影响。受上次搞的「点击加载 Disqus」启发，我也准备写一个点击加载 Gist。

最开始我尝试了传统方法，即动态创建一个 `<script>` 标签并添加到文档流中。然而却得到了一个这个错误：

```
Failed to execute 'write' on 'Document': It isn't possible to write into a document from an asynchronously-loaded external script unless it is explicitly opened.
```

看来动态加载的 js 文件中是不允许写文档流的。而不巧的是 Gist 提供的 embed js 正是使用 `document.write` 来实现的。

在网上找了一下，虽然也有些利用 `iframe` 的解决方法，譬如：[Dynamic Gist Embedding](https://gist.github.com/jeremiahlee/1748966)，但都感觉不咋好~~（嫌麻烦）~~

后来，我在 SegmentFault 的动态预览 Gist 的功能上发现了，Gist 竟然能够提供 JSONP 式的回调！

调用方法只要把 Gist 给你的 embed js 的地址最后的 `.js` 改为 `.json?callback=xxx` 即可（完全没查到 (((　ﾟдﾟ)))

--------------

下面贴一下核心代码（同时也是点击预览的 DEMO）：

<script src="https://gist.github.com/prinsss/a12f8fe71c2e3d7a2c0fcedbc6d625d2.js"></script>

至于「短代码自动替换」呀、「识别 Gist 链接并 append 预览按钮」（SegmentFault 的做法）之类的，朱军可以继续研究~

以上。
