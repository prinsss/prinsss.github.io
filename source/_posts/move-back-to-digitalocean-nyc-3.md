---
title: '全站已搬回 DigitalOcean NYC3 机房'
date: '2015-07-22 06:44:41'
updated: '2015-07-22 06:47:12'
categories: 日常
tags:
  - 博客
  - VPS
---


conoha 东京机房体验了一个星期发现好！慢！啊！[![i_f33](https://img.blessing.studio/images/2015/05/2015-05-24_09-19-271.png)](https://img.blessing.studio/images/2015/05/2015-05-24_09-19-271.png)

虽然带宽是挺大，wget 国外资源都是唰唰唰的，但是到大陆简直小水管，10KBps 的下行速度简直。。

昨晚搞 conoha 的 vps 时把 nginx 艹坏了搞得证书错乱，

各种解决方法无果于是回滚到早上的镜像 [![20150715224933](https://img.blessing.studio/images/2015/07/2015-07-15_14-49-46.jpg)](https://img.blessing.studio/images/2015/07/2015-07-15_14-49-46.jpg)

不得不说conoha的系统重装速度简直慢得一B，DO 恢复 snapshot 半分钟的事儿 conoha 要半小时。。（扶额，不会是肉身重装吧（笑

等了半小时开 conoha 控制面板一看。。

[![20150721213634](https://img.blessing.studio/images/2015/07/2015-07-21_13-38-35.png)](https://img.blessing.studio/images/2015/07/2015-07-21_13-38-35.png)

**WHAT THE FUUUUUUCKKK ! ! ! !なんだこれいみわかねーよ！！**

这尼玛是什么奇异的错误，连镜像恢复页都不能进，窝当时心里千万只草泥马奔腾呼啸而过 ![20150711215742](https://img.blessing.studio/images/2015/07/2015-07-11_13-57-54.jpg)

无法自助恢复只好用捉鸡的日语发了 tickets 就去看 charlotte 了 [![i_f25](https://img.blessing.studio/images/2015/03/i_f25.png)](https://img.blessing.studio/images/2015/03/i_f25.png)，

第二天早上发现了客服的回信：

> (お客様センター) – 2015/07/21 12:46
> 
> ご担当者 様
> 
> いつもご利用いただき、まことにありがとうございます。
> 
> ConoHa お客様センター です。
> 
> お問い合わせの件、OS再インストールが正常に終了していない状況でございました。
> 
> つきましては、<wbr></wbr>弊社にて調整させていただきましたのでご確認ください
> 
> ますようお願いいたします。
> 
> 今後ともConoHaをよろしくお願いいたします。

唔。。大意就是重装没有正常结束 blabla，然后他们帮咱搞好啦

正好碰上出了这档子事儿，也算是个搬家的好机会，就又去 DO 看了看

以前听网上安利的 SFO 机房速度亲测也不是很快，这次就又开了个了 NYC3 机房的比较测试

同样从 vps scp 到本地，SFO 只能跑到 30KBps，但是NYC可以跑到 300KBps

虽然这看起来也是惨不忍睹的速度 [![20150715224933](https://img.blessing.studio/images/2015/07/2015-07-15_14-49-46.jpg)](https://img.blessing.studio/images/2015/07/2015-07-15_14-49-46.jpg) 但是根本就不会有官方测速那么 dio 直飞 2MBps 啊

反正比前两个tokyo的和SFO的已经快很多了，窝对国外vps已经无欲无求了 [![20150710185714](https://img.blessing.studio/images/2015/07/2015-07-10_10-57-26.jpg)](https://img.blessing.studio/images/2015/07/2015-07-10_10-57-26.jpg)

搭建 lnmp 艹起来 wordpress 一切顺利，搬家过程中两台 vps 互相 wget 明明可以飙到 10MBps+ [![20150715224933](https://img.blessing.studio/images/2015/07/2015-07-15_14-49-46.jpg)](https://img.blessing.studio/images/2015/07/2015-07-15_14-49-46.jpg)

难道是窝这里破电信的锅？ [![20150717112829](https://img.blessing.studio/images/2015/07/2015-07-17_03-28-41.jpg)](https://img.blessing.studio/images/2015/07/2015-07-17_03-28-41.jpg)



