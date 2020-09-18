---
title: '使用 URL Mapper 迁移整理 Disqus 评论'
date: '2019-09-26 22:06:00'
updated: '2019-09-26 22:06:00'
categories: 技术
tags:
  - 博客
  - Disqus
---

本文主要介绍了 Disqus 提供的评论迁移工具之一，URL Mapper 的使用方法。

<!--more-->

## 起因与问题分析

Disqus 评论系统以其几乎零配置的安装方式为众人所称道。只要把后台提供的代码插入到页面 HTML 里就能加载评论区，非常方便快捷~~（虽然被墙了）~~。

然而，无需配置这一点也带来了些许隐患。

今天我去 Disqus 后台查看博客上的所有 thread（即一篇文章对应的评论区）时，发现其中记录的全都是些奇怪的 URL：有带着 QQ、微信各种 Query String 一大串的，有 Google 翻译的，有 Web Archive 缓存的，甚至还有不少我自己本地测试域名的，五花八门千奇百怪着实给我看呆了。

![disqus-discussions-weird-url](https://img.prin.studio/images/2019/09/26/disqus-discussions-weird-url.png)

> 顺带一提，根据不同 URL 的数量来看（比如微信的 `?nsukey=`），所有文章里被分享次数最多的是「[为何 shadowsocks 要弃用一次性验证 (OTA)](https://printempw.github.io/why-do-shadowsocks-deprecate-ota/)」，足足有 400 多条。其他还有「[Twitter 账号被锁定是种怎样的体验](https://printempw.github.io/twitter-account-has-been-locked/)」「[命令行界面 (CLI)、终端 (Terminal)、Shell、TTY，傻傻分不清楚？](https://printempw.github.io/the-difference-between-cli-terminal-shell-tty/)」等文章也比较受欢迎。

为什么会这样呢？问题就出在「无需配置也能用」上。

默认情况下，Disqus 给出的通用安装代码类似这样：

```html
<div id="disqus_thread"></div>
<script>

/**
*  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
*  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables*/
/*
var disqus_config = function () {
this.page.url = PAGE_URL;  // Replace PAGE_URL with your page's canonical URL variable
this.page.identifier = PAGE_IDENTIFIER; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
};
*/
(function() { // DON'T EDIT BELOW THIS LINE
var d = document, s = d.createElement('script');
s.src = 'https://blessing-studio.disqus.com/embed.js';
s.setAttribute('data-timestamp', +new Date());
(d.head || d.body).appendChild(s);
})();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
```

其中被注释掉的 `disqus_config` 部分是用于初始化 Disqus thread 的。虽然不配置其中的 `url` 和 `identifier` 也可以用，但是这会导致 Disqus 直接使用当前页面的完整 URL 来初始化评论区。

也就是说，如果默认情况下你没有配置这些变量，**访客每通过一个新的 URL 访问你的文章（就算只有 Query String 不一样），Disqus 就会为它新建一个 thread**。这就导致了[官方帮助文档](https://help.disqus.com/en/articles/1717137-use-configuration-variables-to-avoid-split-threads-and-missing-comments)中提到的 split threads 现象，即我上面在后台看到的一万个 thread。

至于为什么我没配置 `url` 和 `identifier`，那就得问问我当初移植旧主题时脑子放到哪里去了。¯\\\_(ツ)_/¯

在目前的 [Murasaki](https://github.com/printempw/hexo-theme-murasaki) 主题中，这两项分别被配置为文章的 permalink 与 slug。

## 使用 URL mapper 迁移评论

问题根源是解决了，那我们要怎么收拾这个烂摊子呢？

好在 Disqus 提供了几个工具用于迁移评论，其中的 URL Mapper 就可以让我们对 thread 进行批量操作。这个工具接受一个 CSV 格式的文件，其中包含了新旧 URL 的映射关系：**将 A 映射至 B，那么 A 的评论就会被迁移到 B 上**。

> 其他的迁移工具还有 Domain Migration Tool 和 Redirect Crawler，分别适用于仅更改了域名以及已经配置好了 301 重定向的情况。详情可参考官方文档。

首先打开 Disqus 后台，访问 **Community > Tools > Migrate Threads > URL Mapper** 页面，点击「Start URL mapper」，即可下载一个包含了站点中全部 thread URL 的 CSV 文件（下载链接会发送到你的邮箱里）。

用文本编辑器或者其他工具打开这个 CSV，按需修改：

- 如果想将 A 修改为 B，那么就增加一列写上 B；
- 如果某一行无需修改，直接删除该行即可（不要空着）；
- 对于那些不想要的 thread，把它们统一指向一个 404 页面就好啦。

举个栗子：

```csv
https://printempw.github.io/why-do-shadowsocks-deprecate-ota/?nsukey=乱七八糟一大串,https://printempw.github.io/why-do-shadowsocks-deprecate-ota/
https://printempw.github.io/wsl-guide/?nsukey=乱七八糟一大串,https://printempw.github.io/wsl-guide/
https://printempw.github.io/friends/index.html,https://printempw.github.io/friends/
http://localhost:4000/setup-nginx-php-on-windows/,https://printempw.github.io/404.html
```

在刚才那个页面上传修改过的 CSV，Disqus 后台就会开始迁移，迁移结束之后会有邮件提醒。

> 注意！Thread 的迁移是不可逆的，提交前请务必仔细检查。

以下是官方文档里的一些注意事项：

- 迁移最长可能需要 24 小时完成（我半小时左右就好了）；
- 如果你的 CSV 文件非常大，最好把它拆分成多个文件多次迁移；
- 你不能将一个 thread 迁移到另一个 shortname 下去；
- 你可以通过映射来合并两个 URL，所有的评论都会被合并到一个 thread 中；
- 当两个 thread 被 URL Mapper 合并时，第二个 thread 的标题等信息会被保留。

迁移之后 Discussions 页面清爽了不少，爽到。

## 参考链接

- [Use Configuration Variables to Avoid Split Threads and Missing Comments](https://help.disqus.com/en/articles/1717137-use-configuration-variables-to-avoid-split-threads-and-missing-comments)
- [Migration Tools](https://help.disqus.com/en/articles/1717068-migration-tools)
- [URL Mapper](https://help.disqus.com/en/articles/1717129-url-mapper)
- [How to delete discussion threads with incorrect URL in Disqus](https://mycyberuniverse.com/how-delete-discussion-threads-incorrect-url-disqus.html)
- [恢复博客遗失的评论](https://xuanwo.io/2018/10/15/revocer-lost-blog-comments/)
