---
title: 'DigitalOcean 和 ConoHa 的对比与评测'
date: '2015-08-14 00:41:21'
updated: '2016-04-22 19:19:03'
categories: 技术
tags:
  - VPS
  - 评测
---

> 想要购买 ConoHa 的，**三思而后行**。详情：[VPS 被 DDoS 后与 ConoHa 客服的邮件记录](https://prinzeugen.net/mail-log-to-conoha-user-center-after-ddos/)

现在窝的博客已经全线转移到 ConoHa GMO 了，访问速度应该会快一些了，至少在窝这是这样，大概 ctrl+F5 可以在 3s 内打开：

[![console](https://img.prin.studio/images/2015/08/2015-08-13_08-51-51-1024x231.png)](https://img.prin.studio/images/2015/08/2015-08-13_08-51-51.png)

正好窝两家 IDC 同价位的 VPS 都使用了一个月多了，就写一篇评测 DO 和 ConoHa 的文吧。关于窝博客的三次搬迁可以看[这里](https://prinzeugen.net/move-to-conoha-tokyo/)，[这里](https://prinzeugen.net/move-back-to-digitalocean-nyc-3/)，还有[这里](https://prinzeugen.net/wanna-move-back-to-conoha/)。

- - - - - -

### 1. 价格

窝 DigitalOcean 和 ConoHa 买的都是 1G RAM 的 VPS，配置差不多，除了 conoha 是双核 CPU，DO 是单核。两者的价钱有一定差距，conoha 1G RAM 900円/月，约合软妹币 ￥45。DO 1G RAM $10/月，约合 60 软妹币。当然对于壕来说也不是太大的差别啦

### 2. 速度

conoha 窝买的是东京机房，DO 的买过 SFO 和 NYC3 的机房。但是刚买 conoha 的时候似乎正值线路抽风，ping 高下行小，也就是窝从 conoha 搬家到 DO 的理由。不过现在 conoha 东京机房要比 DO NYC3 机房线路好多了，具体可以看[这篇文章](https://prinzeugen.net/wanna-move-back-to-conoha/)。

另外要说的是 DO 的 SFO 机房并没有网上吹的那么玄乎，窝亲身试用也比 NYC3 好不到哪里去。

（到月底之前窝可以提供 ss 账号或者 http 100mb.test 下载测试，有需要请评论）

**UPDATE：**最近 ConoHa GMO 到电信简直起飞啊

[![conoha youtube](https://img.prin.studio/images/2015/08/2015-08-14_03-08-04.png)](https://img.prin.studio/images/2015/08/2015-08-14_03-08-04.png)

<!--more-->

**UPDATE2：**从昨天窝提供试用 ss 账号的反馈来看，conoha 现在不是对所有运营商都这么 dio 的，顺带一提窝是浙江电信，这是窝 现在到本站的 ping 和 100mb.test 下载速度 <span class="collapseomatic " id="id4160" tabindex="" title="点击展开">点击展开</span>

<div class="collapseomatic_content " id="target-id4160">[![ping](https://img.prin.studio/images/2015/08/2015-08-15_01-04-13.png)](https://img.prin.studio/images/2015/08/2015-08-15_01-04-13.png)

[![100mb](https://img.prin.studio/images/2015/08/2015-08-15_01-06-07.png)](https://img.prin.studio/images/2015/08/2015-08-15_01-06-07.png)

</div> 窝也不保证 ConoHa 到各位所在地的速度### 3. 控制面板

这个窝不得不吐槽了，ConoHa 的面板虽然很可爱，但是只有 DO 面板一半好用啊！虽然很可爱！

[![conoha panel](https://img.prin.studio/images/2015/08/2015-08-13_07-40-33-1024x513.png)](https://img.prin.studio/images/2015/08/2015-08-13_07-40-33.png)

保存镜像，恢复镜像/重装系统 速度慢得跟狗爬一样啊，难道是手工重装（大雾）？相比起来 DO 的 Snapshot 简直爽，2分钟左右镜像就好了，恢复镜像也很快。而且窝上次 conoha 恢复镜像时还出现了问题，具体可以看[这里](https://prinzeugen.net/move-back-to-digitalocean-nyc-3/)。

但是 ConoHa 的网页 VNC 是窝用过中**最好用的**。同时也支持手动上传镜像安装（网上一搜一大把 conoha VPS 装 windows server 的教程），顺带一提这是 DigitalOcean 的控制面板：

[![do panel](https://img.prin.studio/images/2015/08/2015-08-13_07-47-01-1024x527.png)](https://img.prin.studio/images/2015/08/2015-08-13_07-47-01.png)

怎么样，很帅气吧，一股 geek 气息。相比起来 conoha 就是一股萌豚气息嘛（笑

不过 conoha 面板要在个人设置中开 conoha 模式才会有背景图哦，默认是简洁风格的

#### 下一页继续哦~ (｀･ω･)

是不是这个分页太阿卡林了呢，都有人看不见窝的小尾巴链接 (´°̥̥̥̥̥̥̥̥ω°̥̥̥̥̥̥̥̥｀)

### 4. 购买难度

购买难度总体来说 DigitalOcean >> ConoHa

DO **只支持** 信用卡 和 paypal 支付，conoha 还可以用支付宝支付（这也是 conoha 被玩坏的原因，最近线路明显好转难道真是流量矿石党走了？

如果你没信用卡但是非要买 DO 家的 VPS 怎么办呢？

> 窝这里推荐一个解决方法：网银卡 + GlobalCash

GlobalCash 具体是什么请自行搜索。如果你连网银卡都没有的话就去找万能的淘宝代充吧。

记住，**千 万 不 要 **用淘宝的代付 Paypal 去激活 DO 账号，**千 万 不 要**。

这是 <span style="color: #ff0000;">[血的教训（点我）](https://prinzeugen.net/fucking-paypal/)</span> 。[![20150808110252](https://img.prin.studio/images/2015/08/2015-08-08_03-03-05.jpg)](https://img.prin.studio/images/2015/08/2015-08-08_03-03-05.jpg)

### 5. 服务器性能（这里都是说窝买的）

其实写到这里也感觉没什么好写了，贴啥啥啥数据啥跑分也和实际使用没什么卵关系，而且这种性能评测网上也是一抓一大把，这里就写一些重要点的东西吧（横向对比）

#### CPU

ConoHa：Intel(R) Xeon(R) CPU E5-2660 v3 @ 2.60GHz / 2 核心 2 线程

DigitalOcean：Intel(R) Xeon(R) CPU E5-2630L v2 @ 2.40GHz / 单核 单线程

#### RAM  内存

ConoHa：1G RAM + 1G Swap

DigitalOcean：1G RAM     [如何添加 Swap 分区？](https://prinzeugen.net/ubuntu-14-04-add-swap-2/)

#### DISK  硬盘

ConoHa：50GB SSD

DigitalOcean：30GB SSD

#### Bandwidth  带宽

同为 100Mbps

### 6.总结

萝卜青菜，各有所爱。VPS 选择也是仁者见仁智者见智的。

不过主要看的还是速度吧，窝就是因为速度的问题来来回回搬迁了这么多次的 qwq，现在 ConoHa 到大陆似乎是吃了大伟哥，简直屌得飞起。

不过不知道以后还会不会这样快了。。[![20150808110355](https://img.prin.studio/images/2015/08/2015-08-08_03-04-04.jpg)](https://img.prin.studio/images/2015/08/2015-08-08_03-04-04.jpg)

最后附上窝的小尾巴链接，如果看到这篇文章的人能用它注册那窝花半个下午写这篇文也值了 qwq，有不清楚的可以评论在下面

- - - - - -

ConoHa 小尾巴：[https://www.conoha.jp/referral/?token=](https://www.conoha.jp/referral/?token=Bjs0Glnw0jR2dwWoocwfjmZJcmeno5ohkw9X52oGT9lmqjBDpb8-MAS)

如果用它注册，你和窝都会得到礼券，不过你和窝都只有在你花费 2,000 日元以上后才能领取。

- - - - - -

DigitalOcean 小尾巴：[https://www.digitalocean.com/?refcode=](https://www.digitalocean.com/?refcode=bbe1e6138132)

使用它注册的话你和窝都可以立即得到 10刀，如果你的消费达到了 $25 ，窝也可以拿到 25刀

忘记使用小尾巴注册但是还想免费拿 10刀怎么办？去网上搜一搜 DigitalOcean 优惠码，在 Billing 的 Promo Code 处填入即可。很多优惠码都只能刚注册后使用哦。顺带一提 Koding 有个活动送 DO 20刀优惠码，上次收到的邮件，不知道现在还有没有用。

- - - - - -

最后，祝愿看到这篇文章的人玩得开心 |∀ﾟ) ノ
