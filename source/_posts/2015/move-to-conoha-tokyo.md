---
title: '全站已搬迁至 conoha 东京机房'
date: '2015-07-13 19:05:30'
updated: '2015-07-13 19:28:09'
categories: 日常
tags:
  - VPS
  - 博客
---

顶图是 conoha 的看板娘 [美雲このは](http://xn--y8j1ek.com/) 哟~

- - - - - -

被安利了 [conoha](https://www.conoha.jp/referral/?token=Hyo3NTnicLIo3cbI2WwTxiROdkwejqSmtGGr1tm5xlpZ25m.Rao-QWN)（窝的推广链接（笑） 的东京机房，窝去看看了看，费用是 900円/月，换算成软妹币差不多45块（安倍经济学大法好 [![i_f25](https://img.prin.studio/images/2015/03/i_f25.png)](https://img.prin.studio/images/2015/03/i_f25.png)）。通过别人的推广链接注册还可以送 1000日元。当时咱就无脑注册了一个 vps 玩玩，配置如下：

[![20150712134657](https://img.prin.studio/images/2015/07/2015-07-13_02-37-59-1024x86.png)](https://img.prin.studio/images/2015/07/2015-07-13_02-37-59.png)

配置还算不错，而且东京机房应该会比 SFO 机房快一些（对各种线路用户来说

付完款到手以后，发现IP竟然被！墙！了！ [![20150711215742](https://img.prin.studio/images/2015/07/2015-07-11_13-57-54.jpg)](https://img.prin.studio/images/2015/07/2015-07-11_13-57-54.jpg)

本来想发 tickets 的，后来转念一想，反正是月底结算，就删掉了 vps 重建了一个。

conoha 和 digitalocean 不一样，删掉 vps 重新创建是可以改掉 IP 地址的，新的IP终于可以正常访问了 [![i_f25](https://img.prin.studio/images/2015/03/i_f25.png)](https://img.prin.studio/images/2015/03/i_f25.png)，遂将 conoha.prinzeugen.net 解析至 vps 开始折腾~

lnmp 咱已经不想再搞他了 [![QQ图片20150627233807](https://img.prin.studio/images/2015/06/2015-06-27_15-39-05.jpg)](https://img.prin.studio/images/2015/06/2015-06-27_15-39-05.jpg) 这次咱用的是 [amh面板](http://amh.sh/)，6块一个月并不算贵。如果你手头紧就自行搜索破解版吧，咱也不好推荐盗版

使用 amh 的一键安装脚本很快就可以配置好，而且是用户友好的 gui 界面，配置很方便，咱很快就把ngnix+PHP+mysql的运行环境搭建好了。amh 面板的软件下载页很全，几乎需要用到的环境都可以找到 [![20150711215742](https://img.prin.studio/images/2015/07/2015-07-11_13-57-54.jpg)](https://img.prin.studio/images/2015/07/2015-07-11_13-57-54.jpg) 就算是窝也不想天天黑底白字啊

顺便将NS换成了dnspod ，正捣腾着amh的时候突然出了上篇文那档子事，不过还好晚上12点左右就恢复了。现在又用回了花生壳的 dns 解析。主域名都已经解析至 conoha 的 vps ，原来的破虚机[在这里](http://vhost.prinzeugen.net/)

虽然中途有碰到过各种事，但也不是什么值得记录的，就先这样吧  [![20150503085737](https://img.prin.studio/images/2015/05/20150503085737.jpg)](https://img.prin.studio/images/2015/05/20150503085737.jpg)



