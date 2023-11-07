---
title: 'Chrome on 5.0+ 应用标题栏上的网站图标'
date: '2015-07-08 07:24:09'
updated: '2015-08-29 00:41:08'
categories: 技术
tags:
  - 前端
  - Android
---

Android 5.0+ 上的 chrome 开启合并标签页和应用后，最近应用列表中，标题栏上会显示一个图标：

[![Screenshot_2015-07-07-23-17-47](https://img.prin.studio/images/2015/07/2015-07-07_15-19-03-576x1024.png)](https://img.prin.studio/images/2015/07/2015-07-07_15-19-03.png)

咱当时还以为是shortcut icon但是并不是 [![QQ图片20150621133428](https://img.prin.studio/images/2015/06/2015-06-21_05-34-38.jpg)](https://img.prin.studio/images/2015/06/2015-06-21_05-34-38.jpg)

看着V2EX呀github呀andy都有，就去看了一下他们的网站源码

发现共同点是在shortcut icon的标签下都有一个叫apple-touch-icon的<link />

搜索了一下：

> 在iPhone,iPad,iTouch的safari上可以使用添加到主屏按钮将网站添加到主屏幕上。
>  apple-touch-icon是IOS设备的私有标签，如果设置了相应apple-touch-icon标签，则添加到主屏上的图标会使用指定的图片。

不过没找到关于chrome的，但是窝在head中加入如下link就可以显示chrome上的图标了~

<link rel="apple-touch-icon" href="/pics/purplesuit.jpg" />



