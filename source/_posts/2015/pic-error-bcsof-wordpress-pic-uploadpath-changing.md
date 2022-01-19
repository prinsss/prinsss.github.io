---
title:   '更改 WordPress 图片默认上传路径后的图片 URL 错误解决'
date:    '2015-06-20 02:23:00'
updated: '2017-06-11 23:38:19'
categories: 技术
tags:
  - WordPress
  - 记录
---

把默认的图片上传地址改成了 `img.prinzeugen.net`，但是原来的文章中所有的图片引用都失效了

本来想不会要一篇一篇改过去吧 ![表情1](https://img.prin.studio/images/2015/05/2015-05-31_10-01-03.jpg) 不过还好想起来可以改数据库

总之就是替换数据库里所有 `www.prinzeugen.net/wp-contents/uploads` 为 `img.prinzeugen.net/uploads` 就可以了，但是窝是 SQL 渣（只是学 SQLite 时知道一点），于是查了下 SQL 基本语法的 REPLACE，总算是搞好啦 ![表情2](https://img.prin.studio/images/2015/05/20150503124308.jpg)，下面是解决方法：

<!--more-->

```
UPDATE wp_posts SET post_content = REPLACE( post_content, 'http://www.prinzeugen.net/wp-content/uploads', 'https://img.prinzeugen.net/uploads')
```

具体进 phpMyAdmin 之类的窝就不写了吧~

------

【2017.6.11 更新】

今天再次把域名从 `img.prinzeugen.net` 换到了 `img.blessing.studio`，正好又有这样的需求。直接搜索博客内容即可，这也是在写博客的好处之一啊。

就是现在回头看两年前的文章有点尬 XD 不过也不打算修改了，留着做个纪念（笑）

```
UPDATE posts SET markdown = REPLACE(markdown, 'img.prinzeugen.net/uploads', 'img.blessing.studio/images')
```

> 不小心把 Ghost 的 posts 表给删掉了，幸好有备份<br>
> 没想到恢复的时候被外键约束给摆了一道，吃瘪了
>
> 2017年6月11日
