---
title:   'OpenWRT 配置 shadowsocks'
date:    '2015-06-28 08:00:08'
updated: '2015-08-29 00:41:27'
categories: 技术
tags:
  - OpenWRT
  - shadowsocks
---

咱折腾了好久都是命令行的方法但是玩玩没想到用LuCI会这么简单 ![bq](https://img.prin.studio/images/2015/06/2015-06-27_15-39-05.jpg)

首先修改opkg配置

```
dest root /
dest ram /tmp
lists_dir ext /var/opkg-lists
option overlay_root /overlay
src/gz r2_base http://downloads.openwrt.org.cn/PandoraBox/ralink/packages/base
src/gz r2_management http://downloads.openwrt.org.cn/PandoraBox/ralink/packages/management
src/gz r2_oldpackages http://downloads.openwrt.org.cn/PandoraBox/ralink/packages/oldpackages
src/gz r2_packages http://downloads.openwrt.org.cn/PandoraBox/ralink/packages/packages
src/gz r2_routing http://downloads.openwrt.org.cn/PandoraBox/ralink/packages/routing
src/gz r2_telephony http://downloads.openwrt.org.cn/PandoraBox/ralink/packages/telephony

arch all 100
arch noarch 200
arch ralink 300
arch ramips_24kec 400
```

刷新列表后，过滤器里过滤 `shadowsocks`：

<!--more-->

![20150627231656](https://img.prin.studio/images/2015/06/2015-06-27_15-53-03.png)

然后就是喜闻乐见的一键安装辣 ![QQ图片20150621134022](https://img.prin.studio/images/2015/06/2015-06-21_05-40-30.gif)

![20150627233035](https://img.prin.studio/images/2015/06/2015-06-27_15-54-09.png)

配置好服务器信息

![20150627231831](https://img.prin.studio/images/2015/06/2015-06-27_15-54-46.png)

还要记得配置ip白名单哦~（从ChinaDNS里扒）

![20150627235746](https://img.prin.studio/images/2015/06/2015-06-27_15-58-01.png)

顺带一提咱的博客在香港主机上，用新加坡代理访问贼慢，就手动加入了白名单~

如果要实现定期更新list的话，请看 [这篇文章](http://www.phpgao.com/carzy_router.html)
