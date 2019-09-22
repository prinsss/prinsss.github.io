---
title: '关于 FormData.get() 的兼容性问题'
date: '2016-07-26 09:47:22'
updated: '2016-07-26 09:50:31'
categories: 技术
tags:
  - 记录
  - JavaScript
---

又踩到坑了，稍微记录一下 ( ・_ゝ・)

我在 Ajax 上传文件时是用的构建 `FormData` 对象的方法，构建完之后我很自然的打算从对象里面取出值来做验证，StackOverflow 里搜了一下之后就知道了有 `FormData.get()` 这个方法，我也没想太多就直接用了，并且在我本地环境（Chrome 51）上没有任何问题。

前天把 beta 版的 v3 皮肤站上线测试了，今天就有人发邮件给我，竟然是 `FormData.get()` 这个语句报错了，提示 `e.get is not a function`，当时我就知道八成又是兼容性问题了 ( \`д´)

查了一下 [MDN 文档](https://developer.mozilla.org/en-US/docs/Web/API/FormData/get) 果然是这样，`FormData.get()` 方法竟然是从 Chrome 50.0 开始支持的，而那个用户用的是三六蛋浏览器，于是就喜闻乐见的 GG 了 ![emotion](https://ooo.0o0.ooo/2016/07/25/5796c0b56c157.jpg)
