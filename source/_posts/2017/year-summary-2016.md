---
title: '我的 2016 年终总结'
date: '2017-01-12 22:53:04'
updated: '2017-06-11 11:08:27'
categories: 随笔
tags:
  - 年度总结
---

> 人生天地之间，若白驹之过隙，忽然而已。——《庄子·知北游》

又到了写年终总结的时候了，时间过得真鸡儿快啊。虽然没有 [Maxine Caulfield](http://life-is-strange.wikia.com/wiki/Maxine_Caulfield) 那样操控时间轴的能力，但是回顾一下我在 2016 的大事件的能力还是有的。

<!--more-->

## 概览

过去的一年里，本博客的基本访问情况如下图：

![Google Analytics Overview](https://img.blessing.studio/images/2017/01/12/QQ20170112172527.png)

这期间，本博客一共迎来了 36,637 位用户，他们一共产生了 56,667 次会话以及 96,728 次浏览。平均每天 100 位用户、155 次会话以及 265 次浏览。

比起去年好了一些，但还是要加把劲让更多的人知道我啊 (`ε´ )

![GA Traffic Source](https://img.blessing.studio/images/2017/01/12/QQ20170112171931.png)

流量大部分是来自 Google 和直接访问，还有其他的一些搜索引擎（让我惊讶的是百度的流量排在第三，要知道我可是完全放弃了对度狗的 SEO 的）和第三方引荐。

> 因为 Ghost 博客系统并没有 WordPress 那么强大的文章管理功能，所以要做统计只能自己去数据库里 SQL 查询啦 |ー` )

过去的一年中，我写了 57 篇博文：

```
SELECT COUNT(*) FROM `posts` WHERE `published_at` > '2016-01-01'

SELECT title, published_at, post_views.pv
FROM `posts` INNER JOIN `post_views` ON posts.slug = post_views.slug
WHERE published_at > '2016-01-01'
ORDER BY post_views.pv DESC
```

其中阅读量最高的几篇文章如下：

- [Android 6.0 刷入 Gapps 后出现 “设置向导” 已停止运行 的解决方法](https://blessing.studio/fixed-setup-wizard-stopped-after-install-gapps-android-6-0/)
- [VPS 被 DDoS 后与 ConoHa 客服的邮件记录](https://blessing.studio/mail-log-to-conoha-user-center-after-ddos/)
- [喜闻乐见被 DDoS + CC 攻击](https://blessing.studio/have-been-ddos-and-cc-attacked/)
- [Hello Ghost, goodbye Wordpress](https://blessing.studio/hello-ghost-goodbye-wordpress/)
- [不忘初心，方得始终](https://blessing.studio/shoshin-wasuru-bekarazu/)
- [Blessing Skin Server 0.1 —— 开源 PHP Minecraft 皮肤站](https://blessing.studio/blessing-skin-server-0-1/)
- [为 Ghost 博客添加页面访问计数器](https://blessing.studio/add-page-view-counter-for-ghost-blog/)

（反倒是那几篇技术文章没怎么人看，我的心情也是很复杂啊）

过去的一年，我的博客上产生了 570 条评论（不包括我发布的）。由于 Disqus 不提供直接查询，我只能导出 XML 后写个脚本分析：

```
Total comments number of last year: 570
[Finished in 0.2s]
```

脚本是用 PHP 写的 (　ﾟ 3ﾟ) 代码托管在 [Gist](https://gist.github.com/printempw/b598abd560c809ea64667d284fc01f0f) 上。

## 关于博客

- 将博客系统由 WordPress [换成了 Ghost](https://blessing.studio/hello-ghost-goodbye-wordpress/)
- 启用了新域名 [Blessing.Studio](https://blessing.studio/migrate-to-new-domain-blessing-studio/)
- 写了更多技术文章
- 分享了一些[开发心得](https://blessing.studio/tag/development-tips/)
- 和许多博主交换了[友链](https://blessing.studio/friends/)

## 学习

- 开始学习 PHP，[接触了 Laravel](https://blessing.studio/tag/laravel/) 这个伟大的框架
- 开发了 [Blessing Skin Server](https://github.com/printempw/blessing-skin-server)，学到了不少东西
- 学会了基于 gulp 等工具的前端工程化
- 学会了软件工程中一些不错的设计模式和架构模式
- 熟练使用了 Shell
- 学习了使用 Git，我这一年的 GitHub 时间线：

![GitHub TimeLine](https://img.blessing.studio/images/2017/01/11/QQ20170111125004.png)

## 其他

- 买了一块 [GTX750](https://blessing.studio/awesome-minecraft-shader/)
- 开始去电影院看电影（说来惭愧，以前一直是盗版侠）
- 看了好几本日版轻小说，顺带尝试了下日亚海淘：

![photo lightnovels](https://img.blessing.studio/images/2017/01/11/QQ20170111130400.jpg)

- 被传染了秦流感，成为了猛男寨住民：

![Mr.Quin](https://img.blessing.studio/images/2017/01/11/QQ20170111125711.png)

- 更依赖 Todoist 了，感觉记忆力在下降（笑）

![Todoist](https://img.blessing.studio/images/2017/01/11/QQ20170111130820.png)

- 买了许多游戏：

![Steam Purchase Log](https://img.blessing.studio/images/2017/01/12/QQ20170112174831.png)

列表里去掉了社区市场的消费记录（学前端知识的好处之一ww）

- 开始使用 Twitter，欢迎关注 [@printempw](https://twitter.com/printempw)：

![Twitter](https://img.blessing.studio/images/2017/01/11/Screenshot_2017-01-11-12-59-37.png)

虽然 14 年就注册了，但是一直没怎么用，只是用来关注喜欢的画师/声优的动态而已。最近倒是一发不可收拾地沉迷其中了，怕不是我的社交媒体魂在燃烧啊 (ゝ∀･)

## 展望 2017

展望个鬼，先好好应付高考再说 (((　ﾟдﾟ)))

------------

最后祝诸君新年快乐，鸡年大吉吧，虽然迟了十二天 |∀` )

![Anmi](https://img.blessing.studio/images/2017/06/11/8b27d6698a9874a90eb46b5481d869bb.jpg)

*Credit: [Anmi](https://twitter.com/Anmi_/status/818404937126187008)*

