---
title:   '给小米路由器 mini 刷 OpenWRT'
date:    '2015-06-28 04:20:25'
updated: '2015-08-29 00:41:31'
categories: 技术
tags:
  - OpenWRT
  - 记录
  - 小米
---


再也受不了 sabi 小米面向小白优化的 rom 了，咱怎么说也算半个 geek 嘛 [![i_f16](https://img.prin.studio/images/2015/05/2015-05-24_09-19-27.png)](https://img.prin.studio/images/2015/05/2015-05-24_09-19-27.png)

而且原生 rom 确实太辣鸡，好好一个 OpenWRT 给整成什么样了。。于是参考网上教程刷了个 PandoraBox ，姑且写一篇博文记录一下吧~

### 拿到路由器的 ssh 权限

小米大概是为了不让小白瞎搞还是什么原因默认关闭了 ssh 权限，请先去 [这里](https://d.miwifi.com/rom/ssh) 解锁 ssh 权限。

（顺带一提窝没好好看说明，在上电的时候操作结果等了这家伙2次 reset [![QQ图片20150621133428](https://img.prin.studio/images/2015/06/2015-06-21_05-34-38.jpg)](https://img.prin.studio/images/2015/06/2015-06-21_05-34-38.jpg)）

<!--more-->

### 准备工具

- ssh 工具（推荐 chrome 应用 [Secure Shell](https://chrome.google.com/webstore/detail/secure-shell/pnhechapfaindjhompbnflcldabbghjo) ）
- scp 工具（GUI 推荐WINSCP绿色版）

顺带安利一波 Babun，windows 下最好用且好看的终端，没有之一

先试一试 ssh 权限：shell 运行 <span class="lang:default decode:true  crayon-inline ">ssh root@miwifi.com</span> ，密码是解锁时给的 root 密码（注意输入密码时是不会显示的哦

[![20150627180705](https://img.prin.studio/images/2015/06/2015-06-27_12-12-52.png)](https://img.prin.studio/images/2015/06/2015-06-27_12-12-52.png)

这样就可以正常在路由器上执行 shell 命令了，开艹吧~

### 刷PandoraBox

cd进入你rom文件所在地 （啊，忘了说了，在 [这里](http://downloads.openwrt.org.cn/PandoraBox/Xiaomi-Mini-R1CM/stable/) 下载rom）

然后把 rom scp 过去（也可以 WINSCP 里拖过去

scp PandoraBox-ralink-mt7620-xiaomi-mini-squashfs-sysupgrade-r1024-20150608.bin root@miwifi.com:/tmp/

会要求口令，输入即可

[![20150627195229](https://img.prin.studio/images/2015/06/2015-06-27_11-53-15-1024x95.png)](https://img.prin.studio/images/2015/06/2015-06-27_11-53-15.png)

然后 ssh 进去，执行（如果有奇怪的错误请把 firmware 改成 OS1）

mtd -r write /tmp/PandoraBox-ralink-mt7620-xiaomi-mini-squashfs-sysupgrade-r463-20150228.bin firmware

[![20150627195957](https://img.prin.studio/images/2015/06/2015-06-27_12-00-24.png)](https://img.prin.studio/images/2015/06/2015-06-27_12-00-24.png)

期间 [] 中会一直 w 啊 e 啊得变来变去，不用慌，多等一会儿，成功刷入后会自动重启

顺带一提重启之后路由器灯变成了骚紫 [![QQ图片20150531180053](https://img.prin.studio/images/2015/05/2015-05-31_10-01-03.jpg)](https://img.prin.studio/images/2015/05/2015-05-31_10-01-03.jpg)

[![IMG_20150627_201629](https://img.prin.studio/images/2015/06/2015-06-27_12-18-49.jpg)](https://img.prin.studio/images/2015/06/2015-06-27_12-18-49.jpg)

还有，默认的root密码是 <span class="lang:default decode:true  crayon-inline">admin</span>  唷

 

- - - - - -

最后放一张 PandoraBox 后台和 ssh 吧 [![QQ图片20150606223914](https://img.prin.studio/images/2015/06/2015-06-06_14-39-25.jpg)](https://img.prin.studio/images/2015/06/2015-06-06_14-39-25.jpg)

[![屏幕截图(61)](https://img.prin.studio/images/2015/06/2015-06-27_12-05-13-1024x576.png)](https://img.prin.studio/images/2015/06/2015-06-27_12-05-13.png)

[![20150627200144](https://img.prin.studio/images/2015/06/2015-06-27_12-06-09-1024x580.png)](https://img.prin.studio/images/2015/06/2015-06-27_12-06-09.png)
