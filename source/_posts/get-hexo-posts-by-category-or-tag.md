---
title: Hexo 获取特定分类或标签下的文章
date: 2017-06-15 22:47:47
updated: 2017-06-15 22:47:47
categories: 技术
tags:
  - Hexo
  - JavaScript
---

今天在将博客主题移植至 Hexo 时，想要获取某个分类（Category）或者标签（Tag）下的所有文章（准确来说是想获得文章总数），在使用中文关键词搜索时，没有获得任何有用的信息（或许是我搜索姿势不对）。换用英文关键词「hexo category all posts」后搜索到了所需的信息，遂决定写一篇文章记录一下，希望能帮到后来人。

### 获取特定分类下的文章 

```javascript
let result = site.categories.findOne({name: 'example'})
```

同样的，你可以这样获取特定标签下的文章：

```javascript
site.tags.findOne({name: 'example'})
```

其中 `name` 指定要查找分类的名称，返回值是一个 Warehouse（Hexo 作者开发的一个轻量级数据库） `Document` 对象。你可以直接使用 `result.length` 来获得该分类 / 标签下的文章总数。你也可以用 `forEach` 来遍历每篇文章：

<!--more-->

```javascript
result.posts.forEach(function(post) {
    // do what you want to do with each post
});
```

而 `result.posts` 是一个 Warehouse 的 `Model` 对象，所以你可以使用一些 `Model` 的高级方法（具体可用方法参见 [Warehouse 文档](https://zespia.tw/warehouse/Model.html)）。举个栗子：

```ejs
<% site.tags.findOne({name: 'example'}).posts.sort('date', -1).limit(5).each(function(post) {%> 
	<%- partial('_partial/project-excerpt', {item: post}) %> 
<% })%
```

这里不得不吐槽一下，Hexo 的文档真是太烂了，太烂了。写个主题，有时候想要实现一个功能还要疯狂看 Hexo 源码，说不出话。

### 参考链接

- [How to select all posts in a certain tag or category and assign it to page.posts of the page I just created? #493](https://github.com/hexojs/hexo/issues/493)
- [How to filter posts by tag in Hexo? - Stack Overflow](https://stackoverflow.com/questions/38998718/how-to-filter-posts-by-tag-in-hexo)
- [Model - Warehouse Documentation](https://zespia.tw/warehouse/Model.html)

