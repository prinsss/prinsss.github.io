---
title: '去掉 Windows 10 RTM 此电脑中的六个文件夹'
date: '2015-08-04 19:36:35'
updated: '2015-08-29 00:35:12'
categories: 随笔
tags:
  - Windows
  - 记录
---

在 win10 早期版本相信大家都是用类似于[这个帖子](http://bbs.pcbeta.com/viewthread-1393590-1-2.html)中的方法去掉那几个文件夹的，

[![20150804110847](https://img.prin.studio/images/2015/08/2015-08-04_03-17-24.png)](https://img.prin.studio/images/2015/08/2015-08-04_03-17-24.png)

但是窝今天在 Win10 RTM 上再次使用此方法时发现此方法失效了

- - - - - -

按照原方法定位至 NameSpace 时，发现此注册表项下的子项变得比以前更多了 ![i_f33](https://img.prin.studio/images/2015/05/2015-05-24_09-19-271.png)

[![20150804105233](https://img.prin.studio/images/2015/08/2015-08-04_03-21-27.png)](https://img.prin.studio/images/2015/08/2015-08-04_03-21-27.png) *原来是只有 6 项的，现在有 11 项 *

按照旧方法删除掉指定的六个文件夹后发现没什么卵用，只是去掉了一个“桌面”文件夹而已

<span class="collapseomatic " id="id2175" tabindex="" title="【点击展开查看图片】">【点击展开查看图片】</span><div class="collapseomatic_content " id="target-id2175">[![20150804105718](https://img.prin.studio/images/2015/08/2015-08-04_03-21-54.png)](https://img.prin.studio/images/2015/08/2015-08-04_03-21-54.png) [![20150804105726](https://img.prin.studio/images/2015/08/2015-08-04_03-20-27.png)](https://img.prin.studio/images/2015/08/2015-08-04_03-20-27.png) 

</div> 然而将这些全部文件夹去掉以后就可以将文件夹全部删掉。但是窝要的是删除一部分文件夹啊！这尼玛地图炮用不得啊 [![20150711215742](https://img.prin.studio/images/2015/07/2015-07-11_13-57-54.jpg)](https://img.prin.studio/images/2015/07/2015-07-11_13-57-54.jpg)

于是自己一个一个试过去，然后也是摸索出了哪个项对应哪个文件夹的关系，但是完成后 Google 了以下，发现也已经有好多人找到了解决方法（并没有找到中文文章，中文搜索结果全是无关的东西）那窝就来做 Google 收录的第一篇中文解决方法吧~

以下内容均翻译自[此文章](http://bjtechnews.org/2015/07/29/removing-those-ignoring-folders-from-this-pc-in-windows-10/)，有删改，窝自己的就不贴了 [![20150715224933](https://img.prin.studio/images/2015/07/2015-07-15_14-49-46.jpg)](https://img.prin.studio/images/2015/07/2015-07-15_14-49-46.jpg) 

**#注意：以下内容均表示在**

HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\MyComputer\NameSpace\

**中需要删除的项名称**

- - - - - -

*#删除“桌面”文件夹*
 {B4BFCC3A-DB2C-424C-B029-7FE99A87C641}

//“桌面”文件夹只有一个项，这就是上面问题的解释

 

*#删除“文档”文件夹*
 {A8CDFF1C-4878-43be-B5FD-F8091C1C60D0}
 {d3162b92-9365-467a-956b-92703aca08af}

 

*#删除“下载”文件夹*
 {374DE290-123F-4565-9164-39C4925E467B}
 {088e3905-0323-4b02-9826-5d99428e115f}

 

*#删除“音乐”文件夹*
 {1CF1260C-4DD0-4ebb-811F-33C572699FDE}
 {3dfdf296-dbec-4fb4-81d1-6a3438bcf4de}

 

*#删除“图片”文件夹*
 {3ADD1653-EB32-4cb0-BBD7-DFA0ABB5ACCA}
 {24ad3ad4-a569-4530-98e1-ab02f9417aa8}

 

*#删除“视频”文件夹*
 {A0953C92-50DC-43bf-BE83-3742FED03C9C}
 {f86fa3ab-70d2-4fc7-9c99-fcbf05467f3a}

 

- - - - - -

最后附上成果图~ [![i_f16](https://img.prin.studio/images/2015/05/2015-05-24_09-19-27.png)](https://img.prin.studio/images/2015/05/2015-05-24_09-19-27.png)
[![20150804114759](https://img.prin.studio/images/2015/08/2015-08-04_03-48-07.png)](https://img.prin.studio/images/2015/08/2015-08-04_03-48-07.png)



