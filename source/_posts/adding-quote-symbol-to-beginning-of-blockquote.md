---
title: '在 blockquote 元素首添加引号'
date: '2015-10-25 02:11:38'
updated: '2015-10-25 03:47:19'
categories: 技术
tags:
  - CSS
  - 设计
---


以前似乎看到过这样的样式，但是忘记保存了。于是到处去翻，发现维基百科有类似的样式，但是。。

[![screenshot1](https://img.blessing.studio/images/2015/10/2015-10-24_09-54-46.png)](https://img.blessing.studio/images/2015/10/2015-10-24_09-54-46.png)

WTF，明明俩伪类就可以解决的。。 [![emotion1](https://img.blessing.studio/images/2015/10/2015-10-24_09-56-11.jpg)](https://img.blessing.studio/images/2015/10/2015-10-24_09-56-11.jpg)

想起 [Long Live Shadowsocks](https://typeblog.net/life/2015/08/21/long-live-shadowsocks.html) 这篇文章里似乎有类似的样式，于是去看了看，但还不是窝想要的效果

[![screenshot2](https://img.blessing.studio/images/2015/10/2015-10-24_09-58-54.png)](https://img.blessing.studio/images/2015/10/2015-10-24_09-58-54.png)

然后就各种找资料，仿照着东拼西凑搞成了差不多满意的样式 qwq

> *The quick brown fox jumps over the lazy dog*

嘛，还算不赖吧~ 

blockquote { margin-bottom: 7px; quotes: "\201C" "\201D"; padding: 2em 25px 2em 30px; position: relative; overflow: hidden; } blockquote:before { content: open-quote; font-size: 3em; position: absolute; left: 0; top: 0 } blockquote:after { content: close-quote; font-size: 3em; line-height: 1; position: absolute; right: 0; bottom: 0 }

 

参考资料：

[https://css-tricks.com/almanac/properties/q/quotes/](https://css-tricks.com/almanac/properties/q/quotes/)

[http://stackoverflow.com/questions/4597699/css-3-adding-quote-symbol-to-beginning-of-blockquote](http://stackoverflow.com/questions/4597699/css-3-adding-quote-symbol-to-beginning-of-blockquote)



