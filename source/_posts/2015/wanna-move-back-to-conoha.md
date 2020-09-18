---
title: '打算搬回 ConoHa 了'
date: '2015-08-13 05:13:22'
updated: '2015-08-13 05:50:14'
categories: 日常
tags:
  - VPS
  - 博客
---


关于站点搬迁的文章已经写了两篇了。。

[DigitalOcean -> ConoHa](https://prinzeugen.net/move-to-conoha-tokyo/)， [ConoHa -> DigitalOcean](https://prinzeugen.net/move-back-to-digitalocean-nyc-3/)

- - - - - -

今天估计是 DigitalOcean 抽风了，到 NYC3 的延迟瞬间爆满，下午的时候一度出现过丢包率 75% 的情况，ssh 都连不上（现在的 ping 稳定在 300ms 左右）。窝受不了了就回去看了看上次被窝放置 play 的 conoha，ping 了一下竟然才 90ms+，当时窝就震惊了，难道是 conoha 的优化还是说那群流量矿石党走了？被 conoha 杀了也有可能（笑

总之 conoha 到窝这得速度突然起飞了，http 下载可以飙到 2M/s+，全国 ping 数据也比 DO 好看多了。于是重装了 conoha VPS 的系统，[安装了锐速](https://prinzeugen.net/use-serverspeeder-to-speed-up-your-shadowsocks/)，scp 一下速度简直叼炸天  [![20150329080245](https://img.prin.studio/images/2015/03/20150329080245.jpg)](https://img.prin.studio/images/2015/03/20150329080245.jpg)

[![scp](https://img.prin.studio/images/2015/08/2015-08-12_12-37-11-1024x206.png)](https://img.prin.studio/images/2015/08/2015-08-12_12-37-11.png)
 对比了一下 DO NYC3 的破数据，窝果断准备换啊，而且 conoha 配置比 DO 好，还比 DO 便宜，现在线路也没问题了，那为什么不换呢~ [![em1](https://img.prin.studio/images/2015/08/2015-08-12_12-42-14.jpg)](https://img.prin.studio/images/2015/08/2015-08-12_12-42-14.jpg)  下面贴一下现在 DigitalOcean 和 ConoHa 各自的全国 ping 

DigitalOcean NYC3：

[![main](https://img.prin.studio/images/2015/08/2015-08-12_13-09-55.png)](https://img.prin.studio/images/2015/08/2015-08-12_13-09-55.png)

ConoHa Tokyo：

[![conoha](https://img.prin.studio/images/2015/08/2015-08-12_13-11-40.png)](https://img.prin.studio/images/2015/08/2015-08-12_13-11-40.png)

不过还是先观望一下，希望不要过几天 conoha 又抽风。现在先准备下，配置好 web 环境



