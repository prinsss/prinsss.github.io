---
title: '替换 Wordpress 的 Gravatar 为 v2ex 的 Gravatar CDN'
date: '2015-07-17 19:35:26'
updated: '2015-08-29 00:36:07'
categories: 技术
tags:
  - WordPress
---


今天咱逛 v2 时突然发现原来 v2 的 gravatar cdn 是可以公开调用的[![20150717112829](https://img.prin.studio/images/2015/07/2015-07-17_03-28-41.jpg)](https://img.prin.studio/images/2015/07/2015-07-17_03-28-41.jpg)

正巧咱艹上了 https ，v2 的 gravatar cdn 又是支持 ssl 的，就懒得自己搭了 [![20150711215742](https://img.prin.studio/images/2015/07/2015-07-11_13-57-54.jpg)](https://img.prin.studio/images/2015/07/2015-07-11_13-57-54.jpg)

只要在主题的 function.php 中的 php 结束标签之前加入如下代码即可：

/*替换为v2ex的Gravatar CDN*/ function getV2exAvatar($avatar) { $avatar = str_replace(array("www.gravatar.com/avatar","0.gravatar.com/avatar","1.gravatar.com/avatar","2.gravatar.com/avatar"),"cdn.v2ex.com/gravatar",$avatar); return $avatar; } add_filter('get_avatar', 'getV2exAvatar');

如果尼的主题已经自带 gravatar 爬墙，但是都不支持 ssl （像窝一样 [![20150715224933](https://img.prin.studio/images/2015/07/2015-07-15_14-49-46.jpg)](https://img.prin.studio/images/2015/07/2015-07-15_14-49-46.jpg)

就在function.php中查找 <span class="theme:arduino-ide lang:default decode:true  crayon-inline ">$avatar</span> 关键字，随机应变替换即可



