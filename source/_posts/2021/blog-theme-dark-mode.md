---
title: '博客主题可以自动切换深色模式啦'
date: '2021-08-09 03:05:00'
updated: '2021-08-09 03:05:00'
categories: 技术
tags:
  - 博客
  - 前端
---

有时候我也很佩服自己，这么简单的一个功能，写写也就几个小时，一年多前就想搞了，竟然给我拖到现在才装上去。拖延症，恐怖如斯！

以前我对深色模式其实不怎么感冒，主要感觉开了也没啥用，就系统界面变黑了，其他 App 里还是白色的，等于没开。不过这几年大部分应用的适配都跟上来了，体验也就好起来了，晚上玩手机看着不那么刺眼，挺好的。

现在浏览器网页也支持检测用户的系统主题色，所以我也凑个热闹，给博客加上了自动切换浅色/深色主题的功能。适配过程还是挺顺利的，记录一下供参考。

<!--more-->

## 原理

就是使用 CSS 的 `prefers-color-scheme` 媒体查询。

```css
@media (prefers-color-scheme: dark) {
  /* dark theme styles go here */
}
```

参考文档：[prefers-color-scheme - CSS | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)

不过需要注意的是，[不支持 IE](https://caniuse.com/?search=prefers-color-scheme)。

## 使用方法

最简单的例子：

```css
body {
  background-color: white;
  color: black;
}

@media (prefers-color-scheme: dark) {
  body {
    background-color: black;
    color: white;
  }
}
```

这样在亮色模式下是白底黑字，在暗色模式下就是黑底白字。

依样画葫芦，给原主题中颜色相关的 CSS 加上对应的深色样式就差不多了。

## 使用 mixin 处理颜色

拿我自己写的这个[主题](https://github.com/prinsss/hexo-theme-murasaki)举例，在主题中我们一般会用到很多颜色。一个常见的做法就是使用 CSS 预处理器，把这些颜色定义成变量方便后续使用（我用的是 [Stylus](https://stylus-lang.com/)）：

```stylus
$color-primary        = convert(hexo-config('primary_color'));
$color-background     = #fff;
$color-text           = #333;
$color-text-secondary = #999;
```

同样，定义这些颜色的深色版本：

```stylus
$color-primary-dark        = convert(hexo-config('primary_color_dark'));
$color-background-dark     = #181a1b;
$color-text-dark           = #c8c3bc;
$color-text-secondary-dark = #a8a095;
```

引用之：

```stylus
body {
  background-color: $color-background;
  color: $color-text;
}

a {
  color: $color-primary;
}

@media (prefers-color-scheme: dark) {
  body {
    background-color: $color-background-dark;
    color: $color-text-dark;
  }

  a {
    color: $color-primary-dark;
  }
}
```

然而问题来了，这样岂不是要写很多媒体查询语句？麻烦且不说，看着都眼花。如果把不同地方的这些语句集中起来，放在一起，又会破坏模块设计，也不利于后续维护。

想要写得简洁一点，不妨利用 CSS 预处理器的 [mixin 特性](https://stylus-lang.com/docs/mixins.html)。

定义 mixin（可以理解为可重用的代码片段）：

```stylus
// 根据传入参数拼装变量名
color-themed(name) {
  color: lookup('$color-' + name);

  @media (prefers-color-scheme: dark) {
    color: lookup('$color-' + name + '-dark');
  }
}
```

这个 mixin 的意思就是我们传一个名称进去，它会根据这个名称去查找对应的颜色变量及其深色版本，然后一起应用。

如此一来，上面的样式就可以简化为：

```stylus
body {
  background-color-themed: 'background';
  color-themed: 'text';
}

a {
  color-themed: 'primary';
}
```

## 使用 CSS 变量处理颜色

用上面那种方法，比原来的是好了不少，但感觉不太直观。

另一种方法，就是用 [CSS 原生的变量机制](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)来处理颜色。定义变量：

```css
:root {
  --color-primary: #7065a3;
  --color-background: #fff;
  --color-text: #333;
  --color-text-secondary: #999;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: #bb86fc;
    --color-background: #181a1b;
    --color-text: #c8c3bc;
    --color-text-secondary: #a8a095;
  }
}
```

使用：

```css
body {
  background-color: var(--color-background);
  color: var(--color-text);
}

a {
  color: var(--color-primary);
}
```

是不是清爽了很多呢？

不过遗憾的是，IE 浏览器[不支持 CSS 变量](https://caniuse.com/css-variables)。（又是你！！！🙃

所以为了兼容性我还是选了预处理器 + mixin 的方法，这样在 IE 上虽然不能自动切换，但至少能保证默认的浅色主题是可以正常显示的。而如果全部使用 CSS 变量的话，在不支持的浏览器上就啥都没有了，得考虑 polyfill 和 fallback，还是算了。

如果不用考虑兼容旧浏览器的话，CSS 变量是最佳选择。

## 加载外部样式

使用 `link` 标签加载的外部 CSS 也可以[指定媒体查询](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link#attr-media)。

比如本主题使用的 [highlight.js](https://highlightjs.org/) 代码高亮的样式：

```html
<link rel="stylesheet" href="atom-one-dark.min.css" media="screen and (prefers-color-scheme: dark)">
<link rel="stylesheet" href="atom-one-light.min.css" media="screen and (prefers-color-scheme: light)">
```

这样在浅色模式下会加载 light 样式，在深色模式下会加载 dark 样式。

## 参考

另外，关于深色模式下的图片要如何处理，其实也是需要考虑的。

不过我懒，就直接不管了。更详细的相关内容可以参考：

- [prefers-color-scheme を用いた Dark Mode 対応と User Preference Media Features | blog.jxck.io](https://blog.jxck.io/entries/2018-11-10/dark-mode-via-prefers-color-scheme.html)
- [prefers-color-scheme: Hello darkness, my old friend](https://web.dev/prefers-color-scheme/)

最后是自动切换的效果图（视频）：

<video src="./dark-mode-switch.mp4" autoplay muted loop></video>

