---
title: 'Node 实现自动解析网易云音乐并转换为 APlayer 配置'
date: '2016-07-25 14:38:45'
updated: '2016-07-25 20:01:05'
categories: 技术
tags:
  - JavaScript
  - 音乐
---

最近在网易云音乐找到了很多很棒的歌，准备找个 HTML5 的播放器挂到博客上去。以前我的博客也是有音乐播放器的，用的是 WordPress 的一个叫 [WP-Player](https://wordpress.org/plugins/wp-player/) 的插件。后来转到 Ghost 的时候就把以前文章里的插件短代码删掉了，也没有再搞播放器了。

今天正好心血来潮，于是去 GitHub 上搜了下，看中了 DIYGod 做的 HTML5 音乐播放器 [APlayer](https://github.com/DIYgod/APlayer)。UI 之类的也很对我胃口于是就马上拿来用了。

配置 APlayer 的播放列表需要提供一个数组，数组里放存放了歌曲信息的字典，大概像这样：

<!--more-->

```
[
    {
        title: '',
        author: '',
        url: '',
        pic: ''
    },
    {
        title: '',
        author: '',
        url: '',
        pic: ''
    },
    ...
]
```

然而我并没有 CDN，所以只能用网易云的源啦。正好我以前用 PHP 写过解析网易云外链音乐的[小脚本](https://work.prinzeugen.net/tools/music.php?id=629877)，今天去看了下发现竟然还能用，也省了窝再去找 API 的时间。

然而要生成一个播放列表，总不能每一次都用这个输一次 ID，然后再一个字段一个字段的复制粘贴吧？这也太不清真了，我们需要更自动化一些（笑）

本来我是想用 Python 写的，但转念一想，我虽然一直在用基于 Node.js 的工具，但是除了写点 gulpfile 之外，几乎没有用 node 写过东西，于是就准备用 Node 来实现了。

于是我随便咕狗了一下，找到了用于发送 HTTP 请求的库 superagent，查了一会儿文档写了个自动转换的小脚本，托管在 Gist 上：

{% my_gist 2bb8c1514589140f461630f21380867d %}

错误处理之类的懒得写了，反正可以直接看报错调试，又不是啥要紧的东西（笑）

---------------

效果：

![Screenshot](https://ooo.0o0.ooo/2016/07/25/5795b31672d8c.png)

APlayer 的效果可以看站点的侧边栏，鼠标点击我的头像就可以看到了哦~

