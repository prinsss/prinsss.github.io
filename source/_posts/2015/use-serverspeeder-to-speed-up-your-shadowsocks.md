---
title: '使用锐速对 TCP 连接提速加速 Shadowsocks'
date: '2015-08-01 03:30:30'
updated: '2015-08-29 00:35:25'
categories: 技术
tags:
  - shadowsocks
  - 锐速
---

关于锐速是否道德的讨论：[V2EX](https://www.v2ex.com/t/164883) ，这种东西仁者见仁智者见智。

- - - - - -

自建的 Shadowsocks 代理速度永远是在 100KBps 左右徘徊 [![QQ图片20150531180053](https://img.prin.studio/images/2015/05/2015-05-31_10-01-03.jpg)](https://img.prin.studio/images/2015/05/2015-05-31_10-01-03.jpg)，搜索优化相关时发现了锐速这个解决方法。试用了三天，<span style="line-height: 1.5;">感觉效果还不错，代理速度提升了，网站内容下载时间也显著减少（然而响应速度是硬伤 qvq</span>

### 锐速是什么，好吃吗？

*锐速 (ServerSpeeder)* 加速软件是一种基于 ZETATCP 加速引擎的软件，可显著提升带宽吞吐量，充分利用服务器带宽。

锐速不能突破原服务器带宽限制，也不会限制服务器带宽的利用

最近推出了永久免费套餐：[http://www.serverspeeder.com/](http://www.serverspeeder.com/)

### 怎么用？

1. 去官网注册一个账号，在后台可以看到锐速支持的 linux 内核。如果你的内核不被支持，请自行更改内核（DigitalOcean 用户可以直接在控制面板更改内核，其他手动更改内核窝会根据 conoha 的 vps 写一篇 （UPDATE: 已完成，在[这里](https://prinzeugen.net/ubuntu-14-04-change-kernel-to-install-serverspeeder/) |ω・´) 

2. 按照官网教程安装

wget http://my.serverspeeder.com/d/ls/serverSpeederInstaller.tar.gz tar xzvf serverSpeederInstaller.tar.gz sudo bash serverSpeederInstaller.sh

接下来一路默认配置。还有一些配置优化相关放到最后讲

### 安装好了。。

做什么呢？嘛，总之先去油管看看视频吧

[![20150802142705](https://img.prin.studio/images/2015/07/2015-08-02_06-30-34.png)](https://img.prin.studio/images/2015/07/2015-08-02_06-30-34.png)

这速度。。嘛啊，还算可以接受吧 [![20150711215742](https://img.prin.studio/images/2015/07/2015-07-11_13-57-54.jpg)](https://img.prin.studio/images/2015/07/2015-07-11_13-57-54.jpg) 比以前好多了

然后可以从服务器下载 [100mb.test](https://files.prinzeugen.net/100mb.test) 文件试试 HTTP 速度

[![20150731191654](https://img.prin.studio/images/2015/07/2015-07-31_11-17-53.png)](https://img.prin.studio/images/2015/07/2015-07-31_11-17-53.png)

wow~ 这 tm 以前快多了，以前可是 60KB/s 的啊 [![20150715224933](https://img.prin.studio/images/2015/07/2015-07-15_14-49-46.jpg)](https://img.prin.studio/images/2015/07/2015-07-15_14-49-46.jpg)

### 总的来说

锐速还是比较有用的，对于个人搭建的 SS 可以起到较好的加速作用，

至少是值得一试 [![QQ图片20150627233807](https://img.prin.studio/images/2015/06/2015-06-27_15-39-05.jpg)](https://img.prin.studio/images/2015/06/2015-06-27_15-39-05.jpg)，反正是免费的嘛



