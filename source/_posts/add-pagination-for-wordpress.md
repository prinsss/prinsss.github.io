---
title: '为 Wordpress 主题添加文章分页功能'
date: '2015-08-28 06:13:02'
updated: '2015-09-27 08:43:44'
categories: 技术
tags:
  - WordPress
  - 博客
---


这篇文章应该算是 定制 *Seventeen* 主题第二弹吧。第一弹 [在这里](https://prinzeugen.net/remove-border-of-img-in-theme-seventeen/)。

最近经常写长文章，但是文章太长的话就难以选择标题的尺寸了，很为难。今天早上听群里人说 wordpress 自带文章分页功能，遂 Google 之，发现只需要在文章中插入 <span class="lang:default decode:true crayon-inline"><!–nextpage–></span>  就可以实现分页了。

但是，想要启用这个功能还需要在主题的 *single.php* 中的 <span class="lang:php decode:true crayon-inline"><?php the_content(); ?></span>  后加入

<?php wp_link_pages(); ?>

才可以实现文章分页功能。

**注意**，有可能你主题的 *single.php* 中只包含了主循环体而没有明显的输出 content，这种情况还请随机应变。可以看看都没有 content，post 之类的字眼。

但是如果只是这样的话，是完全没有定义样式的，简直是丑的可以 [![20150711215742](https://img.blessing.studio/images/2015/07/2015-07-11_13-57-54.jpg)](https://img.blessing.studio/images/2015/07/2015-07-11_13-57-54.jpg)。遂自定义其样式：

注意，以下 CSS 仅适用于 *Seventeen* 主题，其他主题还请自行撰写样式。

将上述的 `<!–?php wp_link_pages(); ?–>` 替换为：

<?php wp_link_pages(array('before' => '<div class="pagenavi hentry" >分页阅读：', 'after' => '', 'next_or_number' => 'next', 'previouspagelink' => '<span class="page-numbers page-previous"></span>', 'nextpagelink' => "")); wp_link_pages(array('before' => '', 'after' => '', 'next_or_number' => 'number', 'link_before' =>'<span class="page-numbers">', 'link_after'=>'</span>')); wp_link_pages(array('before' => '', 'after' => '</div>', 'next_or_number' => 'next', 'previouspagelink' => '', 'nextpagelink' => '<span class="page-numbers page-next"></span>')); ?>

然后随便在哪里插入如下 CSS 代码：

.page-numbers { display: inline-block; line-height: 48px; padding: 0 14px; font-size: 17px; } .page-previous, .page-next { font-size: 17px; font-family: 'FontAwesome'; height: 48px; line-height: 48px; position: relative; width: 48px; } .page-next::before { content: "\f105"; } .page-previous::before { content: "\f104"; } .pagenavi { text-align:center; padding:6px; } .pagenavi > a { color: #A0A0A0; }

这样就可以看在 Seventeen 主题上看到漂亮优雅的文章分页栏辣~

顺带一提如果在 Seventeen 主题中还是像上面那样将 PHP 代码插入到 single.php 中的话，pagination 是会出现在 文章标签 之下的，很丑。

这时候需要将上面的 PHP 代码添加至 *content.php* 的输出 tags 代码 <span class="lang:php decode:true crayon-inline "><?php the_tags(); ?></span>  的前面。  
 最终效果请查看本文章底部：


## 这是第二页

  
 这是第三页哟  
  
 这是第四页。。  
  
 够了吧这么多页了诶  
  
 再来一页好了 qwq  
  
 这是最后一页了  
  
 窝是认真的

BOOM~



