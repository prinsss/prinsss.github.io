---
title: '为 Hexo 博客添加页面访问计数器'
date: '2017-06-25 13:12:53'
updated: '2017-06-25 13:12:53'
categories: 技术
tags:
  - 博客
  - Hexo
  - PHP
---

一般来说，写博客的都喜欢在页面上加上一个访问计数器，来~~满足虚荣心~~显示某篇文章或者整个站点的访问量。这种需求在 WordPress 等动态博客上都是比较容易满足的，安装个插件即可（辣鸡 Ghost 除外），但是对于小部分静态博客来说就比较头疼了。

<!--more-->

目前来看，互联网上的静态博客访问计数器解决方案大致有这么几种：

- 使用「[不蒜子](http://busuanzi.ibruce.info/)」访问计数服务；
- 利用 LeanCloud 平台搭建统计服务。

其中「不蒜子」是个自称「永久免费使用」的极简网页计数器，仅需两行代码即可为静态博客添加访问计数功能，这种简单的解决方案也受到很多静态博客作者的喜爱。但正如我之前在这篇文章（[为 Ghost 博客添加页面访问计数器](https://printempw.github.io/add-page-view-counter-for-ghost-blog/)）中所述，不蒜子虽然提供了 `site_pv`、`site_uv`、`page_pv` 等多种统计，但是其并不提供这些服务的开放 API。而我的需求是在「首页」或者其他文章列表页中的每篇文章都要显示各自的访问量，并且需要一个「最受欢迎的文章」功能（按访问量倒序排序）。很可惜不蒜子无法满足我的需求，只好将其 PASS。

至于使用 LeanCloud 的方法（详情参见[这篇博文](http://crescentmoon.info/2014/12/11/popular-widget/)），其实是利用了这个平台所提供的「数据存储」后端功能，大部分逻辑都在前端完成，而 LeanCloud 只负责存储数据。但是，这个现成的访问计数程序也不支持输出「最受欢迎的文章」功能，只能自己实现。而且，既然我已经有了 VPS，那我为啥还要去弄个 LeanCloud 呢？

综上，我决定自己写一个网页访问量计数服务。

## 0x01 技术选型

前端 `increase`（访问量自增）、`get`（获取访问量）等操作用 JavaScript 来写，这没得选，关键是后端。本来打算后端也用 Node.js 来写的，但是想想我 VPS 上还跑着其他 PHP 项目，使用 PHP 的话运维比较方便（不需要再去另外运行 `forever` 之类的守护进程），而且我对 PHP 也很熟悉，开发效率比 Node、Python 等语言要高。

之前（2016 年一月份）我写的那个适用于 Ghost 博客的访问计数器（[printempw/ghost-hit-counter](https://github.com/printempw/ghost-hit-counter)）也是用 PHP 写的，不过当时并没有使用什么框架，直接原生 PHP 肛上去。这次的项目我打算使用 Lumen 这个「为速度而生的 Laravel 框架」，一来之前在开发 Minecraft 皮肤站（[printempw/blessing-skin-server](https://github.com/printempw/blessing-skin-server)）时已经摸清了 Laravel 那一套，二来 Lumen 在性能强大的同时还能保持 Laravel 高效率开发特性，可以省去不少无用功，专注于业务逻辑本身的开发。

## 0x02 开发

事实证明我选择 Lumen 是正确的。

整个项目包括前端和后端，开发以及测试总共花了我大概三个小时的时间，Lumen 便捷的基础组件让我少走了不少冤枉路：

- `DB` Facade 的一套代码可以同时支持 MySQL 和 SQLite，只需在 `.env` 中配置即可切换数据库源，简直不要再方便；
- 好用且优雅的查询构造器（Query Builder），告别手写 SQL，也无需臃肿的 ORM；
- 优雅且轻量级的路由系统，不用再像原来那样使用丑陋的 Query String 或者手动处理路由；
- `Migration` 数据库迁移功能，将数据表结构信息纳入版本控制系统，部署仅需一句 `php artisan migrate`，不小心搞砸数据库也只需要一句 `php artisan migrate:refresh` 就能完好如新；
- 便捷的 `Cache` 缓存系统，开箱即用的文件缓存，修改 `.env` 配置即可将后端无缝切换至 Redis；
- 可直接使用 Laravel 的 `ThrottleRequests` 节流阀中间件，哪里限流套哪里；
- 自带超好用的时间处理类库 `Carbon`；
- 开箱即用的异常处理系统以及完整的日志记录，etc.

成品开源在 GitHub 上（[printempw/hexo-view-counter](https://github.com/printempw/hexo-view-counter)），采用 GPLv3 协议，欢迎 star 或修改自用，Live Demo 就是这个博客。另外这也是我第一次使用 Atom 编辑器从头开始开发一个项目，一路用下来使用体验还是蛮不错的（之前都用的 Sublime Text3）。

![Atom](https://img.prin.studio/images/2017/06/25/snipaste_20170624_222645.png)

## 0x03 使用方法

安装部署方法我不多说，自己去项目 README 看，反正就是 Laravel 那套。而且我顺便魔改了下 Lumen 的框架结构，删掉了一大票目前用不着的东西，同时把入口文件从 `/public` 子目录移到项目根目录下了，所以 Nginx 用户只需要配置好 URL 重写，Apache 用户啥都不用干就行。

这个项目只提供基本的 API（具体看 README），其他逻辑需要在博客前端完成，下面贴一下我自己在用的脚本（某些语句依赖于 jQuery，可自行修改）：

<script src="https://gist.github.com/prinsss/2e0e0c127a0f5081434b4dbe136327c1.js"></script>

需要注意的是，「最受欢迎的文章」页面需要后端提供文章标题，但是我思来想去，都想不到什么好的解决方法。原先搞 Ghost 的访问计数器时可以直接访问 Ghost 的数据库来获取文章信息，但是静态博客就不行了。虽然想过各种自动化的方法（譬如自动去爬标题之类的），但想想还是作罢。目前情况是，文章相关的 record 会随着访问而自动生成（`slug`、`pv`、`created_at` 等字段），但是 `title` 字段并不会自动填写（NULL）。所以如果你需要热门文章功能的话，可以定期访问计数器的数据库，手动填写文章的标题信息。

而且这样虽然不优雅，但也能有效防止他人恶意请求造成垃圾数据过多（静态博客没有好办法去验证请求的 `slug` 是否存在），想要清除无效数据只需运行 `DELETE FROM post_views WHERE title = ""` 即可。

## 0x04 总结

对比一下使用现成服务和自己搭建的优缺点，顺便测试下 Hexo 的 GFM 表格支持：

| 功能支持            | 不蒜子  | LeanCloud | 自建           |
| --------------- | ---- | --------- | ------------ |
| 数据导入与管理~~作弊~~   | 不可   | 可，比较麻烦    | 完全可以自己瞎搞     |
| 开放 API          | 无    | 业务逻辑都在前端  | 有            |
| 部署难度            | 超方便  | 还行        | 最麻烦          |
| 可扩展性（热门文章 etc.） | 无    | 需要自己编写    | 需要自己编写       |
| 部署费用            | 免费   | 免费        | 需要支持 PHP 的主机 |
| 靠谱程度            | 也许靠谱 | 挺靠谱的      | 看你主机靠不靠谱     |
| 装逼程度            | 还行   | 还行        | 逼格高          |

\_(:3」∠)\_ 以上。
