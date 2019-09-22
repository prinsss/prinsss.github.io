---
title: '替换 W3 Total Cache 在 Wordpress 后台侧边栏图标的方法'
date: '2015-07-27 23:41:46'
updated: '2015-08-29 00:35:38'
categories: 技术
tags:
  - WordPress
  - PHP
---


W3 Total Cache 是个很好的 WordPress 缓存插件，提供页面数据库等等的硬盘缓存和 memcached 缓存，比 WP Super Cache 不知道高到哪里去了（笑，然而这个极好的插件却。。

### TMD 在侧边栏上的图标和其他的 没！对！齐！

### 还 TM 是彩！色！的！Fucking Colorfuuuuul !

[![W3](https://img.blessing.studio/images/2015/07/2015-07-27_06-58-45.png)](https://img.blessing.studio/images/2015/07/2015-07-27_06-58-45.png) 看看这破玩意儿，卧槽这尼玛果断不能忍啊 [![i_f33](https://img.blessing.studio/images/2015/05/2015-05-24_09-19-271.png)](https://img.blessing.studio/images/2015/05/2015-05-24_09-19-271.png)

忍着不适将其配置好后马上开始着手替换这破图标。第一步自然是搜索引擎大法，遗憾的是都没有人写类似的文章。。难道用 W3TC 的强迫症只有窝这么一个吗。没办法了，自己动手，丰衣足食。

想到的第一个办法是替换图标源文件。审查元素发现是在 *w3-total-cache/pub/img/w3tc-sprite.png*，

包含了 mouseover 和 mouseout 的两种图标，还有个 *w3tc-sprite-retina.png* 适用于高分辨率。。[![20150711215742](https://img.blessing.studio/images/2015/07/2015-07-11_13-57-54.jpg)](https://img.blessing.studio/images/2015/07/2015-07-11_13-57-54.jpg) 尼玛这搞个 dio 啊搞起来麻烦死了啊混蛋，还是用从代码下手吧

把插件下载下来，shell 下执行 <span class="lang:sh decode:true crayon-inline">find .|xargs grep -ri “w3tc-sprite.png” -l</span>  /* [坑1](#1) */，定位到引用此图标的文件 *./lib/W3/Plugin/TotalCacheAdmin.php* ，再定位至

#toplevel_page_w3tc_dashboard .wp-menu-image { background: url(<?php echo plugins_url('w3-total-cache/pub/img/w3tc-sprite.png')?>) no-repeat 0 -32px !important; }

还有一大段差不多的代码窝就不贴了，将其注释掉（聪明点，别一大块注释，不然会有奇怪的错误 

这段代码是自定义当添加侧边栏菜单的函数

add_menu_page( $page_title, $menu_title, $capability, $menu_slug, $function, $icon_url, $position );

<span style="line-height: 1.5;">没有指定 $icon_url 时的 CSS 。具体原文在</span>[这里](http://codex.wordpress.org/Function_Reference/add_menu_page)<span style="line-height: 1.5;">。</span>

注释掉保存后刷新页面可以看到侧边栏的骰子图标不见了。接下来就要自定义图标了。这里窝用的是 WordPress 中的图标字体，具体都有什么可以看[这里](https://developer.wordpress.org/resource/dashicons/#admin-generic)。窝用了 dashicons-admin-generic 的齿轮图标

[![gear](https://img.blessing.studio/images/2015/07/2015-07-27_07-19-01.png)](https://img.blessing.studio/images/2015/07/2015-07-27_07-19-01.png)

具体使用方法就是在 $icon_url 参数位置填上 <span class="lang:default decode:true  crayon-inline ">‘dashicons-admin-generic’</span> //[坑2](#2)

再次查找使用了 add_menu_page 函数的文件 <span class="lang:sh decode:true  crayon-inline ">find .|xargs grep -ri “add_menu_page” -l</span> ，可以看到是在 *./lib/W3/Menus.php* 里调用的，调用代码是这样的：

add_menu_page(__('Performance', 'w3-total-cache'), __('Performance', 'w3-total-cache'), 'manage_options', 'w3tc_dashboard', '', 'div');

将其替换成这样：

add_menu_page(__('Performance', 'w3-total-cache'), __('Performance', 'w3-total-cache'), 'manage_options', 'w3tc_dashboard','','dashicons-admin-generic', 'div');

坑2注意，WP 官方给的函数中参数有 7 个，但是 W3TC 中只用了 6 个。咱当时将那个空引号替换后发现没生效还以为是窝哪里搞错了又到处寻找解决方法。。。（扶额 ，估计那个空引号是 $function 吧，窝具体也没深入了解

总之将其这样替换后，图标问题是已经完美解决了 [![20150329080245](https://img.blessing.studio/images/2015/03/20150329080245.jpg)](https://img.blessing.studio/images/2015/03/20150329080245.jpg)

[![dekita](https://img.blessing.studio/images/2015/07/2015-07-27_07-31-16.png)](https://img.blessing.studio/images/2015/07/2015-07-27_07-31-16.png) 唯一的问题就是不知道为啥图标到最后去了。。

难道是 css 定位出问题了。。嘛，能用就行了 [![i_f25](https://img.blessing.studio/images/2015/03/i_f25.png)](https://img.blessing.studio/images/2015/03/i_f25.png) 总算了却窝心头一桩大事

 

关于坑一：

吗的窝本来不知道用 find 一个文件一个文件翻过去找的窝好苦啊 [![i_f33](https://img.blessing.studio/images/2015/05/2015-05-24_09-19-271.png)](https://img.blessing.studio/images/2015/05/2015-05-24_09-19-271.png)



