---
title: 博客样式与字体的更新报告
date: '2017-02-26 17:29:56'
updated: '2017-04-28 13:20:47'
categories: 日常
tags:
  - 博客
  - 字体
  - 设计
---

一直想改进一下博客的字体和在手机上的样式，奈何最近一直没有时间，只好作罢。昨天晚上抽出一些时间做了一些改进，顺便写篇博文算是记录~~灌水~~（笑）。

<!--more-->

【更新 17/04/24】

- 正文字体已由 Monda 改为 PT Serif
- [调整了](https://twitter.com/printempw/status/856456764803301376) blockquote 的样式

### 标题字体改为 Roboto Slab

Roboto Slab 是[粗衬线体](https://zh.wikipedia.org/wiki/%E7%B2%97%E8%A1%AC%E7%BA%BF%E4%BD%93)，比起 Georgia 更适合做标题。

![效果图](https://ooo.0o0.ooo/2017/02/26/58b29e66b01d7.png)

*（上面是 Georgia，下面是 Roboto Slab）*

### 全局除正文外的西文字体使用 Alegreya

之前正文以外的西文字体都是使用的 Georgia，同样是衬线字体，[Alegreya](https://fonts.google.com/specimen/Alegreya) 的衬线更加富有书法气息，比较帅气。

![Alegreya](https://ooo.0o0.ooo/2017/02/26/58b29a1894a08.png)

这里摘抄一段 [JUSTFONT BLOG](http://blog.justfont.com/2014/06/google-fonts-1/) 对 Alegreya 的介绍：

> Alegreya 目前已经小有成就：曾在国际文字设计协会 (Atypi) 的字体设计比赛 Letter2 中拿下奖项，被认为是近十年来最重要的 53 个字体之一。它是个专门为长文阅读打造的字体。除了造型令人回想起文艺复兴时期的诗人手书以外，这个字体造型上的动感与韵律让长时间阅读变得比较有味道。虽然是根据古典的造型打造，但应用到现代的排版环境上，也不特别觉得突兀。

以本博客底部的版权信息为例看看对比效果（上面是 Georgia，下面是 Alegreya）：

![对比图](https://ooo.0o0.ooo/2017/02/26/58b2839230fd0.png)

### 正文字体改为 Monda

之前博客正文中的西文字体是使用的 [Alegeya Sans](https://fonts.google.com/specimen/Alegreya+Sans)。这是一款根据与 Alegreya 相同骨架设计的人文主义感非衬线字体。它很漂亮，但可惜它在正文中的表现还是有些不尽人意，这次索性改成了 [Monda](https://fonts.google.com/specimen/Monda) 这款无衬线字体。

我之前的 [Tweet](https://twitter.com/printempw/status/835472326221127683) 里也有提到过，对比图如下（上面是 Alegreya Sans *Medium*，下面是 Monda *Regular*）：

![对比图](https://img.prin.studio/images/2017/02/26/QQ20170226164005.png)

### 全局字体大小由 15px 改为 14px

因为之前使用的 Alegeya Sans 比起 `font-size` 相同的中文字体在视觉上要小一些，为了能够看清西文字体遂将字体调大了。改为 Monda 之后就可以不用这么处理了，字体大小改为 14px 也没有什么看不清的。

行高也由原来的 `1.8px` 增加至 `1.9px`，阅读起来应该会舒适一些。

### 使用 affix.js 替换 jQuery lockfixed

这个主题原先是使用 [jquery-lockfixed](https://github.com/ymschaap/jquery-lockfixed) 来实现侧边栏固定小工具的，但这玩意有时候会出现神秘的 BUG，遂使用 Bootstrap 的 [affix.js](http://getbootstrap.com/javascript/#affix) 替换掉它。

```js
$('#sbpin').affix({
    offset: {
        top: function () {
            return $('#abovesb').offset().top + $('#abovesb').outerHeight()
        }
    }
});
```

### 取消手机上内容左右两侧的 margin

因为这个主题是卡片式的设计，每篇 POST 都是以卡片的形式展示出来的。而原主题在手机上也保留了这个设计，造成了很大一部分都被用于显示卡片的边缘。

这次我也把卡片的两边的 margin 给去掉了，并且修改了一下侧边栏，把空间都空出来给正文，这样阅读体验会更好一些。效果可以看[这里](https://twitter.com/printempw/status/833219482554245121)。

### 改进侧边栏在手机上的表现

以前手机上侧边栏是直接隐藏起来的，只保留最上面的名片部分，因此侧边栏上的 [Hitokoto](https://printempw.github.io/a-hitokoto-crawler/) 小工具和 [Do you like me](https://printempw.github.io/do-you-like-me-mysqli-version/) 小工具在手机上都不可见了，还是比较蛋疼的。

我稍微修改了一下，现在侧边栏的内容在手机上会被放到所有内容的底部。这样的好处是一进入文章页首屏就是正文，而不是像以前那样首屏是我的名片。

~~（首屏是名片也没什么不好的啊）~~

### 改进「返回顶部」按钮

给「返回顶部」的按钮加了个滚动到一定程度才出现的效果，以前是直接固定着的（早该加了）。

这个样式参考了 Hexo 的一个主题：[NexT](https://github.com/iissnan/hexo-theme-next/blob/master/source/js/src/post-details.js)。

### 延迟加载 Disqus

这其实之前就实现了，不过也在这里提一下吧。

我对进行了一些改动，代码托管在 [Gist](https://gist.github.com/prinsss/e31ae00ddbadf1b0237c56a36e7ee6b1) 上：

<script src="https://gist.github.com/prinsss/e31ae00ddbadf1b0237c56a36e7ee6b1.js"></script>

上面那个「点击加载 Gist」按钮也是我之前[折腾](https://printempw.github.io/how-to-load-gist-dynamically-via-clicking-button/)的。

### 添加文章目录 TOC

这个也是一直想做的，然而实现了发现没地方放……

以后再看看能加到哪里吧，效果参见我之前发的[推文](https://twitter.com/printempw/status/833210925255516160)。

----------

很惭愧，做了点微小的工作。附上以前我对博客样式的折腾：

- [最近有点迷上字体排印学了](https://printempw.github.io/wow-typography/) *2015-11-16*
- [对博客进行了稍微的调教](https://printempw.github.io/adjust-blog/) *2015-08-03*

如果哪里样式有不对头，或者对本博客的样式有什么意见/建议的话，请在下方评论区告诉我 :D
