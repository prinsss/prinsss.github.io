---
title: '关于 JavaScript 的函数默认参数的兼容性'
date: '2016-07-21 18:45:14'
updated: '2016-07-26 09:51:17'
categories: 技术
tags:
  - JavaScript
  - 记录
---

最近在写 Blessing Skin Server V3 的前端的时候，定义带可选参数的函数的时候经常这样定义：

```
function showModal(msg, title = "Messgae", type = "default") {
    var btn_type = (type != "default") ? "btn-outline" : "btn-primary";
    var dom = '/* 省略 */';
    $(dom).modal();
}
```

因为 PHP 写多了，也就想当然的认为 Js 的默认参数也是这样写的，而且 PC 上的测试也是一切正常，所以也没多想什么。

然而今天我在一台手机上测试的时候，发现事件没有绑定上，找了好久原因（因为手机没有控制台也不能设置断点，只好用最原始的办法在可能出问题的行上加上 `alert('fuck')` 来调试）也只是把出错的函数找了出来，却死活看不出有哪里不对 ![emotion](https://img.prinzeugen.net/image.php?di=E0G2)

<!--more-->

正好今天在折腾 bower 和 gulp 的前端自动化协作，抱着死马当活马医的心态运行了 `$ gulp lint`（以前用过一段时间的 jshint，但因为老是提示 $ 未定义就不用了 qwq），结果竟然报了这个错：

```
assets\js\utils.js: line 9, col 31, 'default parameters' is only available in ES6 (use 'esversion: 6').
assets\js\utils.js: line 9, col 49, 'default parameters' is only available in ES6 (use 'esversion: 6').
assets\js\utils.js: line 15, col 28, 'default parameters' is only available in ES6 (use 'esversion: 6').
assets\js\utils.js: line 26, col 34, 'default parameters' is only available in ES6 (use 'esversion: 6').
assets\js\utils.js: line 26, col 52, 'default parameters' is only available in ES6 (use 'esversion: 6').
```

当时我就卧槽了，赶紧 Google 了一下，发现 JavaScript 的函数默认参数竟然是在 ES6 才成为标准的：[默认参数值 - MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Default_parameters#规范)

而我那台破机子的浏览器内核并不支持这个特性于是就 GG 了 
![](https://ooo.0o0.ooo/2016/07/21/5790a8a3c1e25.jpg)

~~写 PHP 写傻了~~

