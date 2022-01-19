---
title: '博客迁移至 GitHub Pages'
date: '2018-08-24 02:16:56'
updated: '2018-08-24 02:16:56'
categories: 日常
tags:
  - 博客
---

就在刚才，我把博客完全迁移到了 GitHub Pages 上。

为啥呢？简单来说，就是我懒得维护服务器了。

<!--more-->

去年十月份，我为博客添加了 [Travis CI 自动构建流程](https://prinsss.github.io/deploy-hexo-blog-automatically-with-travis-ci/)，发布新博文只需要把 Markdown 源码 push 至 GitHub 上的仓库，CI 会帮我自动完成后续的所有步骤，很适合我这种懒人。

在我的 CI 脚本中，博客构建完毕后会把构建结果 [同时推送](https://github.com/prinsss/prinsss.github.io/blob/source/.travis/deploy.sh#L19) 至 GitHub Pages 和我自己的服务器。由于我之前一直是在自有服务器上部署的动态博客程序（WordPress、Ghost），一直用下来也没什么不妥，所以当时我也只是把 GitHub Pages 当成一个备胎，博客域名依然是解析到自有服务器上的。

但是最近我想了想，把博客部署在自己的服务器上，有几点不好：

首先是服务可用率。我是个穷屌，只有一台 DigitalOcean $5 的机器，既没有负载均衡，也没有冗余服务器。如果这台机器宕掉了，那博客就只能跟着下线，谁也访问不了。而且事实上我的服务器就有好几次莫名其妙出现过 Kernel Panic，收到监控报警后只能灰溜溜地去登录控制台重启服务器。

另外就是，我想在这个世界上留下点什么东西。如果博客放在我自己的服务器上的话，假如我出了啥三长两短、服务器久了没人管理，那我的博客很有可能就烟消云散了，多难过啊。

不过当然啦，要是那么在意这个的话，我就去用 Medium 这类写作平台，而不是自建独立博客了。我觉得 GitHub Pages 这类托管服务算是一个不错的平衡点，既保留了独立博客的风格，又不用特别去担心服务器的问题，自己只用操心内容就够了，挺不错的。
