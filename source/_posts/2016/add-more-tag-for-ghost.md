---
title: '为 Ghost 博客添加 more 标签支持'
date: '2016-04-17 13:28:50'
updated: '2016-11-26 19:35:17'
categories: 技术
tags:
  - Ghost
  - 博客
---

众所周知，WordPress 有个 `<!--more-->` 标签可以控制预览输出的内容，在 `<!--more-->` 之后的内容是不会显示在预览中的，需要进入 Post 页才能看到完整内容。

蛋疼的是，Ghost 并不支持类似的功能，只能让它自动切割预览内容（根据字数）。这 TM 的就非常尴尬了，刚刚在展示窝惠的魅力时（上一篇 Post），如果让 Ghost 自己来切的话，就会把三张图片全部切在预览里，这样首页就会变得贼大，所以得想个法子了。

<!--more-->

以下解决方法来自这个 [Pull Request](https://github.com/arianf/Ghost/commit/3bb95eb6028ed63f37fff0809932d4aac01b20ed)，有修改。

找到 `core/server/helpers/content.js`，在第 22 行的 `if` 语句里面加一个 `<!--more-->` 标签的判断：

> 注意：新版 Lodash 将 `contains` 函数更名为了 `includes`。如出现 `_.contains() is not a function` 的情况，请将下面代码中的 `contains` 替换为 `includes`。

```javascript
if (truncateOptions.hasOwnProperty('words') || truncateOptions.hasOwnProperty('characters')) {
    if (_.contains(this.html, '<!--more-->')) {
        var split = this.html.split('<!--more-->', 2);
        return new hbs.handlebars.SafeString(split[0]);
    }

    // original code here
}
```

原 PR 里是在原来的 `if` 语句上面加一个 `if`，但是这样会把即使不是预览的内容请求也给切割了，所以在切割之前要先判断 `hasOwnProperty('words')`。

同理你也可以把 `<!--more-->` 改成 `<cut />` 等标签来自定义。

以上。
