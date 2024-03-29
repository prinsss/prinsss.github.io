---
title: '为 Hexo 博客添加隐藏文章功能'
date: '2018-11-14 23:33:30'
updated: '2019-11-30 16:25:00'
categories: 技术
tags:
  - 博客
  - Hexo
  - JavaScript
---

> 更新：咕了一万年之后插件终于更新了，从 `hexo-sage-posts` 更名为 `hexo-hide-posts`，修复了「上一篇 / 下一篇文章」暴露隐藏文章入口的问题，添加了 `hidden:list` 命令，另外用了点小 hack，支持自动向隐藏文章页面插入 `noindex` 标签防止搜索引擎收录。

隐藏博客中某些特定的文章应该算是一个比较常见的需求，毕竟谁都有些不希望让别人看到的东西。当然啦，你可能会说，「不想被看到就不要放到博客上来嘛」。话是没错，不过有时候人就是这么别扭，想让某些文章被看到，却又不想被所有人看到，又或者是某些文章只想和自己熟悉的人一起分享。

<!--more-->

于是我写了一个 Hexo 插件 **[hexo-hide-posts](https://github.com/prinsss/hexo-hide-posts)** 来实现这个需求（网上也有一些关于 Hexo 隐藏文章的教程，不过一般都要求修改主题文件，还是我这样写个插件更通用一些）。它的功能如下：

- 在博客的所有文章列表中隐藏指定的文章（包括首页、存档页、分类标签、Feed 等）；
- 被隐藏的文章依然可以通过文章链接直接访问（比如 `https://hexo.example/{slug}/`）；
- 除非知道链接，任何人都无法找到这些被隐藏的文章。

如果你用过 YouTube，应该会比较容易理解这一套逻辑。当一个 YouTube 视频被设定为 **[限定公開](https://support.google.com/youtube/answer/157177)**（这是日文的译文，我觉得这个比较贴切。中文译作「不公开」，英文为 Unlisted）时，这个视频就是 **只有知道链接的人才能访问**，既不会显示在频道中也不会被搜索到。本插件就是借鉴~~抄袭~~的这个功能。

~~另外，插件名中的 [sage](https://knowyourmeme.com/memes/sage) 这个单词，混过匿名版（A 岛、K 岛以及各种 futaba 贴图版）的同学可能会比较熟悉。Sage 词源为日文中的 **下げ**（さげ，降低、下沉），回复讨论串时在 E-mail 栏填入这个单词可以避免该串被顶起（上げ，上浮）。虽然这和本插件的功能并不一致，但我还是借用了这个名称，纯粹是脑子一热，没什么特别的理由。（笑）~~

插件的具体使用方法都写在 README 里了，这里就不再赘述。安装插件后，在想要隐藏的文章的 front-matter（就是 Markdown 顶上的那个参数块）里添加一行 `hidden: true` 即可。

至于插件的原理嘛，简单来说就是在 Hexo 运行 [generator](https://hexo.io/zh-cn/api/generator.html) 之前修改储存所有文章的变量 `hexo.locals.posts`，从中排除掉被标记为 `hidden: true` 的文章，这样所有的 generator（用于生成首页、存档页、Feed 等）都会直接忽略掉这些文章。接下来我们覆写了原来的 `post` generator（它用于生成具体的文章页面），让它能正常处理那些被隐藏的文章。这样的结果就是，`post` generator 会帮我们生成具体的文章页面（即 `public/{slug}/index.html`），但是其他所有的页面中都不会包含这篇文章，除非你手动在其他文章中添加了该文章的链接。

对具体实现有兴趣的话可以直接去看插件源码，注释我也写得蛮详细的（不如说注释都要比源码多了）。另外，还是要再吐槽一下 Hexo 的辣鸡文档（上一次吐槽是 [移植主题](https://prinsss.github.io/get-hexo-posts-by-category-or-tag/) 的时候），为了写这个插件我基本上把 Hexo 的源码都翻了一遍，绝了。
