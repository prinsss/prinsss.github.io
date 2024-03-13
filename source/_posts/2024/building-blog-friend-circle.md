---
title: 重构博客友链页面，又一个友链朋友圈开源
date: '2024-03-13'
updated: '2024-03-13'
categories: 技术
tags:
  - 博客
---

先来看看效果：[友情链接 - PRIN BLOG](https://prinsss.github.io/friends/)。

自我感觉还是不错的，友链的博客们有什么更新都可以实时展示在页面上，一目了然。作为博主，不用打开 RSS 阅读器就可以查看新文章；作为访客，也可以快速找到更多自己感兴趣的内容，比起原来全是链接的页面，看起来也让人更有点击欲望了。

从临时起意到开发完成总共两个晚上，最速传说就是我！~~（误）~~

<!--more-->

## 缘起

前段时间看到有个博客用了这样的一个东西：

- [Rock-Candy-Tea/hexo-circle-of-friends: 友链朋友圈](https://github.com/Rock-Candy-Tea/hexo-circle-of-friends)
- [朋友圈 | Black Flies](https://www.yyyzyyyz.cn/fcircle/)

当时就感觉卧槽好高端，很有想法。

就像我在本站友链页里说的一样，独立博客之间的联系基本上就是靠的链接交换和评论互访。一个博客的访客看到了其他博客的链接，点过去看了，然后从对面的友链中，又导航到新的博客……如此往复，我们就依靠着这种从现在看来显得十分古老的方式，维系着这些信息孤岛之间的纽带。原始又浪漫。

不过这里就会涉及到一个用户点击率的问题。我自己之前在维护友链页面的时候，总感觉只放标题和链接看起来效果不怎么好。就算加上描述、头像这些元素，也总觉得差点意思。因为一个博客最重要的其实还是它的内容，仅靠一个网站标题，可能很难吸引到其他用户去点击。

**而「友链朋友圈」的这种形式，就像微信朋友圈一样，作为一个聚合的订阅流，展示了列表中每个博客的最新文章。**

比起干巴巴的链接，这显然会更加吸引人。虽然我写博客到现在也已经 9 年了，早就佛系了，主打一个爱看不看。不过对于和我交换了友链的博主们，还是希望他们能够获得更多的曝光和点击（虽然我这破地方也没多少流量就是啦……），也希望我的访客们也可以遇到更多有价值的博客。

***

然而在准备接入的时候，我发现这玩意儿不就是一个小型的 RSS 阅读器么……其实等于是自己又实现了一套订阅管理、文章爬取、数据保存之类的功能。

于是我就寻思，可能直接复用已有 RSS 阅读器 API 的思路会更好，让专业的软件做专业的事。友链的管理也可以直接复用 RSS 阅读器的订阅管理功能，这样增删改也不需要了，我们就只需要封装一下查询的 API，提供一个精简的展示界面就 OK。

## 技术栈选择

作为行动力的化身，咱们自然是说干就干，下班回家马上开工！

首先是 RSS 后端的选择。

市面上的 RSS 阅读器有很多，我自己主要用的是 Inoreader。然而我看了下，[Inoreader API](https://www.inoreader.com/developers/rate-limiting) 只面向 $9.99 一个月的 Pro Plan 开放，而且限制每天 100 个请求……这还玩个屁。[Feedly](https://developers.feedly.com/reference/introduction) 也是差不多一个尿性，可以全部 PASS 了。我也不知道该说他们什么好，也许做 RSS 真的不挣钱，只能这样扣扣搜搜了吧。

另外一个选择就是各种支持 self-host 的 RSS 阅读器，比如 [Tiny Tiny RSS](https://tt-rss.org) 和 [Miniflux](https://miniflux.app)。我之前部署过 TTRSS，说实话感觉还是太重了。Miniflux 则是使用 Go 编写的，该有的功能都有，非常轻量级，部署也很方便。就决定是它了！

技术栈方面选择了之前一直比较心水的 [Hono](https://hono.dev)，部署在 Cloudflare Workers 上。前端方面没有使用任何框架，连客户端 JS 都没几行，基本上是纯服务端渲染。有时候不得不感叹技术的趋势就是个圈，以前那么流行 SPA，现在又都在搞静态生成了。

页面渲染使用了 Hono 提供的 [JSX](https://hono.dev/guides/jsx) 方案，可以在服务端用类似 React 的语法返回 HTML，挺好用的。不过 CSS 没有用 Hono 的那一套 CSS-in-JS，因为要允许用户覆盖样式，所以要用语义化的类名。最后选了 [Less](https://lesscss.org)，还是熟悉的味道。

前端文件的构建使用了 [tsup](https://tsup.egoist.dev)，配置文件就几行，爽。

## 实现

实现思路很简单，就是做一个 Proxy 层，把：

- `GET /v1/categories/22/entries` - [Get Category Entries](https://miniflux.app/docs/api.html#endpoint-get-category-entries)
- `GET /v1/categories/22/feeds` - [Get Category Feeds](https://miniflux.app/docs/api.html#endpoint-get-category-feeds)

这两个 Miniflux 的 API 包一下。这里要注意不能暴露实际的 API Endpoint，避免可能的恶意攻击。API 缓存也要在我们这一层做好，防止频繁刷新把服务打爆。

缓存策略上使用了 SWR (Stale-While-Revalidate)：

1. 拿到 API 响应后，放到 KV 中，同时把时间戳放入 metadata；
2. 后续从 KV 读取缓存时，对比当前时间和 metadata 中的时间戳；
3. 如果经过的时间没有超过设置的 TTL，说明缓存有效，直接返回前端；
4. **如果经过的时间超过了 TTL，则标记缓存为 `stale` 状态，依然返回前端**；
5. 此时，后端在后台重新请求 API，并将最新的响应写入 KV 中；
6. 下一次再从 KV 读取时，拿到的缓存就是最新的了。

这样可以保证最快的响应速度，以及相对及时的更新速度，比较适合这种场景。

最后的交付形式其实就是两个 HTML 页面，通过 `<iframe>` 的形式嵌入到网页中。另外参考 [giscus](https://giscus.app) 提供了一个脚本，可以设置参数并自动完成 iframe 的初始化，用户只需要引入一个 `<script>` 标签即可，非常方便：

```html
<script
  async
  data-category-id="28810"
  src="https://blog-friend-circle.prin.studio/app.js">
</script>
```

当然也可以作为独立页面打开，有做双栏布局适配：

[blog-friend-circle.prin.studio/category/28810/entries](https://blog-friend-circle.prin.studio/category/28810/entries)

## 开源

新版博客友链朋友圈的所有代码都开源在 GitHub 上，欢迎使用：

👉 [prinsss/blog-friend-circle](https://github.com/prinsss/blog-friend-circle)

这个方案和 hexo-circle-of-friends 并没有孰优孰劣之分，只是侧重点和实现方式不同。不过我这个的一个好处是，如果你已经在用 Miniflux 了，那么可以直接复用已有的大部分能力，不需要再起一个 Python 服务和数据库去抓取、保存 RSS，相对来说会更轻量一些。

如果你选择使用 Miniflux 官方提供的 RSS 服务，甚至可以无需服务器，部署一下 CF Workers 就行了，像我这样的懒人最爱。
