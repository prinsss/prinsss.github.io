---
title: '使用子文件夹管理 Hexo 文章且不改变文章永久链接'
date: '2019-10-13 03:38:00'
updated: '2020-01-15 19:45:00'
categories: 技术
tags:
  - Hexo
  - 博客
---

> **2020-01-15 更新**：如果你只是想实现「文章源码放在子目录、永久链接保持不变」的效果，可以直接修改 `_config.yml` 中的配置：
> ```yaml
> permalink: :name/
> new_post_name: :year/:title.md
> ```
> 感谢 [@SukkaW](https://skk.moe/) 在评论区提供的建议！

在 Hexo 中，我们可以通过站点配置中的 `permalink` 配置项来指定文章的永久链接的格式。比如说默认值是 `:year/:month/:day/:title/`，那么一篇 slug 为 `hello-world` 的文章，最终生成的链接就是 `2019/10/13/hello-world/`。

如果你不想分得这么细，也可以根据自己的喜好 [自定义这个配置项](https://hexo.io/zh-cn/docs/permalinks)。本博客就将其设置为了 `:title/`，即仅使用文章的 slug 作为永久链接，更清爽一些。

但是这样一来，文章源文件的管理就有点难办了。Hexo 中所有的文章（Post layout）都存放在 `source/_posts` 目录中，如果仅使用 slug 作为文件名的话，文章一多就会出现乱成一坨的惨状 —— 只能通过文件名查找，根本无法通过日期定位文章！

<!--more-->

![too-many-files-in-posts-chaos](https://img.prin.studio/images/2019/10/13/too-many-files-in-posts-chaos.png)

但如果你在 `_posts` 目录下新建子文件夹来存放文章，比如 `_posts/2019/hello-world.md`，你就会发现，最终生成的文章链接中也会带上这个子文件夹的名称：`https://hexo.example/2019/hello-world/`。

这可咋整？难道就不能在不改变文章永久链接的情况下，把文章源文件放到子文件夹里去吗？

当然可以！Hexo 可是以灵活~~随便~~著称的 JavaScript 写的博客程序，那还不是想怎么魔改就怎么魔改？这里我抛砖引玉，介绍一种使用 filter 对文章永久链接进行操作的方法。其他应该也有不少方法能实现同样的效果，欢迎各位在评论区分享交流。

先贴代码（直接放到站点根目录的 [`scripts`](https://github.com/prinsss/prinsss.github.io/tree/source/scripts) 文件夹中就可以了）：

```js
// posts-subfolder
const { join } = require('path');
const { readdirSync } = require('fs');
const moment = require('moment');

// 使用子文件夹管理文章且不改变文章永久链接
// e.g. "source/_posts/2019/slug.md" => "https://hexo.example/slug/"
hexo.extend.filter.register('post_permalink', function (permalink) {
  // 想保留在文章永久链接中的子文件夹
  const excludes = [];

  const postDir = join(this.source_dir, '_posts');
  const folders = readdirSync(postDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(dir => !excludes.includes(dir));

  for (const name of folders) {
    if (permalink.startsWith(`${name}/`)) {
      // 删除链接中的子文件夹名称
      return permalink.replace(`${name}/`, '');
    }
  }
});

// 使 `hexo new` 生成的文件保存至相应的年份子文件夹中
// @see hexo/lib/plugins/filter/new_post_path.js
hexo.extend.filter.register('new_post_path', data => {
  const year = moment(data.date || Date.now()).format('YYYY');
  data.path = join(year, data.slug);
  return data;
}, 1); // 设置为高优先级
```

其中 `post_permalink` 和 `new_post_path` 都是 Hexo 预留的钩子，所以基本不用费什么力气（不得不说，Hexo 的插件系统设计还是很不错的，非常灵活，也埋了足够多的 filter 和 event，基本覆盖了整个生命周期）。

修改 `post_permalink` filter 传进来的值就可以直接修改最终生成的文章永久链接，所以我们直接把自定义的子文件夹从 `permalink` 中删掉，这样文章链接中就不会出现子文件夹的名称啦，非常简单粗暴。

```text
> _posts $ tree
.
├── ...
├── 2018
│   ├── ...
│   ├── the-difference-between-cli-terminal-shell-tty.md
│   └── wsl-guide.md
└── 2019
    ├── disqus-migration-tools-url-mapper.md
    ├── first-post-of-2019.md
    └── hexo-posts-in-subfolder.md
```

我使用了年份来组织文件，基本上就足够了~~（反正我一年也写不了几篇）~~。

另外附送个我批量整理源文件时用的命令：

```bash
# 记得配合自己实际的 front-matter 格式修改一下哦
grep -r "date: '2015-" *.md -l | xargs mv -v -t 2015/
```

Happy hacking.
