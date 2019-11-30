---
title: '一种监测 VTuber 直播并自动录像的方法'
date: '2018-10-29 23:45:36'
updated: '2018-10-29 23:45:36'
categories: 技术
tags:
  - VTuber
  - 音视频处理
---

首先是惯例的闲聊时间。

虽然这是我第一次在这个博客中提到 [Virtual YouTuber](https://zh.wikipedia.org/zh-cn/%E8%99%9B%E6%93%ACYouTuber)，不过我大概也算是比较早开始看 VTuber 的那一批人了。从始皇帝老爱（[キズナアイ](https://zh.wikipedia.org/wiki/%E7%B5%86%E6%84%9B)）诞生、四天王聚首，到年初 [狐叔](https://ja.wikipedia.org/wiki/%E3%83%90%E3%83%BC%E3%83%81%E3%83%A3%E3%83%AB%E3%81%AE%E3%81%98%E3%82%83%E3%83%AD%E3%83%AA%E7%8B%90%E5%A8%98Youtuber%E3%81%8A%E3%81%98%E3%81%95%E3%82%93) 引领的个人势井喷，再到以彩虹社（[にじさんじ](https://ja.wikipedia.org/wiki/%E3%81%AB%E3%81%98%E3%81%95%E3%82%93%E3%81%98)）为首的 2D 势、杂谈生放势展示了 VTuber 更大的可能性，而注意到这块肥肉的资本们也纷纷入场，百花争鸣的 VTuber 战国时代就此拉开序幕……如此种种，VTuber 界的快速发展令人眼花缭乱，也难怪有「一个月 = VTuber 历一年」的说法。

<!--more-->

不如说 VTuber 的世界实在过于精彩，每天都有大量好玩的内容产出，以至于我甚至已经很久没有看新番动画等传统 ACG 作品，就连游戏也不玩了，只能说 VTuber 沼恐怖如斯。

![meme_i_am_ok](https://img.blessing.studio/images/2018/10/29/meme_i_am_ok.jpg)

为什么突然谈起这茬？其实我一直都想写一篇关于 VTuber 的文章，但是当时由于学业之类的原因只能搁置。然而到了现在，时间和精力确实是有了，但是正处繁荣期的 VTuber 市场的复杂度，却已经不再是我这孱弱的文笔能够描绘的了。只能说，非常遗憾。

既然写不出来，那就不写，这是我写博客的标准。如果参考别人的文章照猫画虎、东拼西凑，确实是能挤出一点像样的文字，但那种中途半端的东西又有什么意思呢？我写博客是给自己看的，不是拿去哗众取宠的。所以，牛逼的文章就交给牛逼的人去写，我只管写我自己能写得出来的东西就够了。

好了，闲话休题，今天我们的主题是「如何对 VTuber 的直播进行自动录像」。

-----

为什么会有这个需求呢？

简单来说，直播系的 VTuber 虽然有着视频系所无法比肩的「亲近感」与「参与感」，但是直播的形式也不可避免地要消耗观众更多的时间与精力（关于直播系与视频系优缺点的讨论网上有很多，我这里就不再深入）。毕竟当个 NEET 一天 25 小时高强度看直播还是比较有难度的，所以碰到上课、上班时喜欢的 VTuber 正好开播的话就很吃瘪。

虽然大部分直播系 VTuber 都有为学畜社畜着想、基本都会留下直播的存档录像，但还是有好几个「臭名昭著」的，喜欢突击直播又不爱留档的选手，比如说 —— [神楽めあ](https://twitter.com/Freeze_Mea)。~~（本来想在这里稍微介绍一下这位屑女仆，但是我发现三言两语根本解释不清 Mea 这个混沌且复杂的 VTuber，遂作罢。或许我下篇关于 VTuber 的博文会是「浅谈神楽めあ的魅力」也说不定，咕咕咕）~~

但是我又特别喜欢看她的直播、不想错过，怎么办呢？

要么就他力本願，拜托录像班录好上传，要么就自己动手、丰衣足食。

-----

好歹我也会捣鼓点代码，于是我就写了几个脚本来完成我的需求（让计算机按照自己的意愿工作，我觉得这就是编程的醍醐味），监视 YouTube、OPENREC、Twitch、TwitCasting 等平台，只要主播一开播就自动开始录像。代码开源在 GitHub 上：

👉 [**printempw/live-stream-recorder**](https://github.com/printempw/live-stream-recorder) 👈

脚本是我几个月前写的，跑得还算安稳，也成功帮我录下了不少惨遭 Mea 削除存档的直播，可喜可贺。因为当时搜索类似解决方案时基本没看到几个，所以最近把代码整理了一下，糊了个像样的文档分享出来。使用方法都在项目 README 里说明了，这里就不再赘述。

这玩意儿的原理其实很简单，就是每隔 30s 查询一次直播状态（这一块比较难搞），如果在播就开始录像。录像方面，使用 [youtube-dl](https://github.com/rg3/youtube-dl/) 或者 [streamlink](https://github.com/streamlink/streamlink) 等工具获取直播 HLS 的 `.m3u8` 地址，然后直接交给 ffmpeg 进行录制（还能顺带推流转播，不得不说 ffmpeg 真是神器）。

![live-stream-recorder_logs](https://img.blessing.studio/images/2018/10/30/live-stream-recorder_logs.png)

因为功能就这么点，所以我选择了用 Shell 脚本来完成，之后有时间的话或许会用 PHP 给它套个便于操控的网页前端。也可以再优化一下，把轮询模式改为 Pub/Sub 模式，节省点资源（不过我那台 VPS 就是为了录像买的，所以说实话怎样都好）。总之，有缘再说吧。

-----

其他类似的项目：

- [【转播 man】其他平台转播到 bilibili 的一种方法](https://www.bilibili.com/read/cv1083415)
- [简单易用 外网直播流转播至 B 站的小工具](https://www.bilibili.com/read/mobile/1122933)
- [AutoYtB —— 自动检测 youtube 与推特进行自动转播至 B 站并进行录制与转码](https://www.bilibili.com/read/cv1388431)
