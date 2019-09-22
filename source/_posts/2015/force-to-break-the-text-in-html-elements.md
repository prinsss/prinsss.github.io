---
title: '使 HTML 元素中的文字强制自动换行'
date: '2015-08-10 05:46:34'
updated: '2015-08-10 06:06:27'
categories: 技术
tags:
  - CSS
  - 前端
---


唔。。有可能你会碰到这种情况：

[![1](https://img.blessing.studio/images/2015/08/2015-08-09_14-04-35.png)](https://img.blessing.studio/images/2015/08/2015-08-09_14-04-35.png)

文本溢出元素了。原因是因为窝用的主题作者没有设置洋文的 break-all，怕截断正常单词，于是就。。 窝以前就直接用 <pre> 标签就算了，然而有些东西放代码高亮里不好看，于是给作者提了个 issue，dalao 说是今晚 commit，但是好像跳票了~[![20150808110355](https://img.blessing.studio/images/2015/08/2015-08-08_03-04-04.jpg)](https://img.blessing.studio/images/2015/08/2015-08-08_03-04-04.jpg)

没办法只好自己动手丰衣足食，Google 了一下总结了个临时解决方法：

### 1.在文章中加个内联 CSS

<style type="text/css"> .withBreak { word-wrap: break-word; } </style>

在文本编辑器中加入就不用窝讲了吧。当然直接加到主题的 style.css 里也可以哦。

记得插入后 **不要 **切换至可视化编辑器，坑爹的 TinyMCE 会把内联 CSS 搞没掉  :(

### 2.给需要强制换行的 HTML 标签加上 class 属性

按照上面 CSS，就加上 <span class="lang:default decode:true  crayon-inline ">class=”withBreak”</span> ，举个栗子：

<blockquote class="withBreak"> https://www.feedly.com/home#subscription/feed/%s </blockquote>

### 3.Cool! It’s Done. 贴上完成后效果

[![2](https://img.blessing.studio/images/2015/08/2015-08-09_14-04-53.png)](https://img.blessing.studio/images/2015/08/2015-08-09_14-04-53.png)

- - - - - -

//窝非前端，都是 Google 来的，如有 dalao 发现错误请指正 (つд⊂)



