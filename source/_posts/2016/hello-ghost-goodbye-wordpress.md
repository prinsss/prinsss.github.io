---
title: 'Hello Ghost, goodbye Wordpress'
date: '2016-01-31 02:21:10'
updated: '2016-01-31 09:12:56'
categories: 日常
tags:
  - 博客
  - WordPress
  - Ghost
---

虽然以前就一直想要弃用 WordPress 了，但是由于没有时间~~（懒）~~ ，而且也是对这个完善的 CMS 有了感情。

然而在 ConoHa 的 VPS 被 DDoS 而搬迁至 DigitalOcean 后，我奇怪的发现 WordPress 的响应速度慢了很多。TTFB 甚至达到了史无前例的 16s。

对于这种情况，我第一个想到的就是数据库的锅。然而看了慢查询日志，导出 wp query 却发现问题不在数据库查询上。

后来又使用了排除大法，最终将问题定位于我所使用的 Seventeen 主题上。

看来是主题中做了什么耗费大量 CPU 时间的事件，导致前后台响应慢成狗（默认主题没事）。

要知道同样内存，ConoHa 和 DigitalOcean 的 CPU 配置可不只差了一点半点。这也是我最初选择 ConoHa 的原因之一。

然而发生了这档子事，反正我是再也不会去用 ConoHa 了。

那么怎么办呢？活人总不能让尿憋死吧。

<!--more-->

懒得找是哪个函数的问题，那么干脆把主题的模板扒出来，重新写个主题吧。转而一想，反正要重写主题，那为什么不把主题移植到 Ghost 平台上呢？

说干就干，于是今天下午就开始了移植工作。

得益于之前看过的 Ghost 主题开发文档，移植工作进展的很顺利，大概一个半小时左右就完成了。

不过由于 handlerbars 模板语言的限制，原版主题的配置项是肯定无法实现了，所以我只好把相关设置项放在文件的注释中以供选择（譬如 color-theme）。

至于菜单和小工具，同样由于 Ghost 的机能所限，只能靠用户手写静态 HTML 啦，我在模板注释中提供了菜单及小工具的模板。

关于代码高亮，我使用了 highlight.js 的 Arduino Light 模板，可以自动识别类似于 language-xxx 这样的 class，所以在 Markdown 中尽管放心地写 <code>```Javascript</code> 这样的格式吧～

关于 WordPress 的文章导出，可以使用 Ghost 官方的[插件](https://wordpress.org/plugins/ghost/)，提供了导出文章，页面等信息至 json，以及自动转换为 Markdown 等功能。转换出来的 json 直接在 Ghost 的 Labs 里导入即可，固定链接等信息均会被保存。

一点需要注意的是，Ghost 中并没有所谓分类目录的概念，只有标签。所以要注意修改标签哦。

关于博主们最关注的评论，我选择了使用 Disqus 来实现。Ghost 不提供原生的评论功能，
所以其实也没几个选择，而且我也不喜欢多说。创建 Disqus 账户及站点后，就可以在[这里](https://import.disqus.com/)导入来自 WordPress -> Tools -> Export 导出的 XML 文件。不要用 Disqus 的 WP 插件来导入，那样的话无法指定 forum name。

不过 Disqus 对游客不显示其邮箱的 Gravatar，有点蛋疼的。

那么至此站点迁移就完成啦，感觉和迁移前看不出什么变化对不对？（笑）现在可不会再出现 Pending 地狱了哦。

顺带把站点换成了蓝色的 color-theme，总是绿色也要审美疲劳的嘛。

最后放一张原来 WordPress 后台的截图以示纪念：

![wordpress-dashboard](https://img.prin.studio/legacy/image.php?di=GS78)

再见了，WordPress，我依然喜欢你。

你好，Ghost，从今以后还请多多关照。
