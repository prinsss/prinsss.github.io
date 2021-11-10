---
title: '为 Ghost 博客添加页面访问计数器'
date: '2016-01-31 23:37:00'
updated: '2016-04-17 13:45:25'
categories: 技术
tags:
  - Ghost
  - 博客
---

博客搬迁到 Ghost 后，原来的 Post Views 无法显示一直是窝的一大心病。

众所周知 Ghost 是使用模板语言 handlebars 来开发主题的，这也就造成了主题开发者们很难输出一些动态内容，而只能使用其内置的助手函数输出有限的可变内容。

总不能就这样下去吧，于是窝经过了一番搜索，找到了这个东西 —— [不算子](http://busuanzi.ibruce.info/)。

看来困扰于静态页面访问计数的不止窝一个啊。然而看了一下，不算子并不提供可调用的 API，也就是说窝没办法在文章分页上显示每篇文章的点击数了。

这怎么行？于是窝动了自己写计数服务的念头。

<!--more-->

仔细想了想其实也并不难实现，Ghost 的 posts 数据表中 slug 字段储存了每篇文章的永久链接，可以以这个为标识符进行计数。而模板助手函数 `{{url}}` 可以输出类似于 `/fuck-you-man/` 这样的相对链接。

这样就好办了，给计数器的标签设置一个 data 属性为 `{{url}}`，然后遍历所有计数器，取出 data 切个片，Ajax 请求后端得到访问量并赋值即可。

看起来行得通的样子，于是窝花了一个晚上，也是写出了个挺像模像样的东西~~（并不）~~。

思路是在 Ghost 数据库中新建一个数据表，存放 slug 以及对应的 pv，uv。uv 现在还未实现，因为还没有想好 IP 列表该怎么存，而且也不咋用得到，就懒得管它了。前端可以用类似于 `index.php?action={get|add}&slug=fuck-you-man` 这样的 URL 来进行 Ajax 请求。

关于防恶意 POST，窝思来想去没想到啥好解决方法~~（懒）~~，于是用了最原始的方法 —— 限制两次请求之间的间隔。如果有啥好的想法，欢迎评论留言。

至于从 WP-PostViews 插件中导出数据，也不难。思路是遍历所有 `wp_postmeta` 中 `meta-key` 字段为 `views` 的记录，通过 `post_id` 去 `wp_posts` 表找到 `post-name` 字段（和 Ghost 的 slug 是一样的），稍微处理一下就好了。~~等窝写好了也会一起贴出来。~~

转换脚本已经写好了，本来想用 Python 来处理的，但是最后由于懒得找适用的包所以作罢 QvQ。最后用 PHP 简单的实现了下，贴在下面（如果等待响应很长时间不要打窝）。

**更新**：添加了 “热门文章” 功能，访问 `index.php?action=order&limit=10` 即可得到访问量前 10 的文章列表 （json），示例代码也一起贴在下面了。

源码托管于 [Gist](https://gist.github.com/prinsss/f8626711835718c1ad68)，~~适用于使用 MySQL 的 Ghost 用户。如果你是使用 SQLite，而且恰好需要这个功能的话，留言给窝，窝也好有点动力。~~

**更新**：应 Andy 之托，支持了 SQLite。MySQL & SQLite 通用版在[这里](https://gist.github.com/prinsss/a1018424b3bf03b0072f)。

<script src="https://gist.github.com/prinsss/f8626711835718c1ad68.js"></script>

转换脚本如下：

<script src="https://gist.github.com/prinsss/3a72cf916a6689c7a665.js"></script>

-----

就窝把 post view 上线这几分钟里，post_views 表中就多了好多记录，看来窝还是满受欢迎的嘛~~（错觉）~~

![ac musume emotion](https://img.prin.studio/legacy/image.php?di=FO6F)
