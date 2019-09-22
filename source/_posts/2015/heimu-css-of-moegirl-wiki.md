---
title: 萌百的刮刮乐样式
date: '2015-09-12 00:19:50'
updated: '2016-07-08 13:48:24'
categories: 技术
tags:
  - CSS
  - 前端
  - 博客
---

<style>
.heimu { 
    background-color:#252525 !important;  
    color:#252525 !important; 
    text-shadow:none !important;
}
</style>

今天看萌百时突然想到的。萌娘百科有个刮刮乐的样式，或者叫黑幕？就像这样 <span class="heimu">这是很黑很黑的黑幕</span>，正常浏览的时候是黑色的，看不到其中的文字，只有选中那一段后才可以看见。

以前也不怎么会 css，只是觉得这挺好玩的，也没深究。最近也算是懂了些前端，好歹能写点像样的东西了。今天看到萌百的黑条时，突然有一种 “非复吴下阿蒙” 的感觉（笑）

看了看那黑条的样式，和窝想的差不多，写了一个 `.heimu` 的 class，指定 `background-color` 为 黑色 `#252525!important`，精简后就像这样：

```css
.heimu { 
    background-color:#252525 !important;  
    color:#252525 !important; 
    text-shadow:none !important; 
}
```

顺带一提萌百 `<a>` 标签的样式没有写，鼠标悬浮在上面就会粗线蓝色的超链接了

刮开有惊喜哟| ω・´)：<span class="heimu">并没有惊喜</span>



