---
title: 使用制表符生成字母的字符画
date: '2015-12-28 00:00:57'
updated: '2016-01-30 19:09:36'
categories: 技术
tags:
  - Python
---


今天看到了 [AnotherHome](https://www.anotherhome.net/about) 的首页源码，发现了注释里的这玩意：

![antherhome html comment](https://img.prin.studio/images/2015/12/2015-12-27_07-49-21.png)

觉得挺有意思的，正好闲着，就写了个用制表符生成字母画的脚本：

![exec result](https://img.prin.studio/images/2015/12/2015-12-27_07-51-34.png)

还是 Python 实现，源码托管于 [Gist](https://gist.github.com/prinsss/689a1da4b515aa682d4b)。

明明不是很复杂的东西，想保存字符画的数据结构时却想了窝好长时间 qwq

本来是想定义个类，然后生成 A-Z 的实例，可以取出各行内容的，后来想想一个用一个 dict 就好了，key 是大写字母，value 是保存有各字母字符画的各行字符串的 list。

![blessing studio result](https://img.prin.studio/images/2015/12/2015-12-31_14-46-13.png)

各位 dalao 见笑了 [![pa](https://img.prin.studio/images/2015/10/2015-10-03_12-39-25.jpg)](https://img.prin.studio/images/2015/10/2015-10-03_12-39-25.jpg)



