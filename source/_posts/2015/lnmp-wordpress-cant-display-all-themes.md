---
title: 'lnmp 搭建 WordPress 后台不能显示所有主题'
date: '2015-07-10 23:37:15'
updated: '2015-08-29 00:36:37'
categories: 技术
tags:
  - PHP
  - WordPress
---

wordpress搬到vps上后，后台主题页只剩下一个默认的 Twenty Fifteen 了

[![QQ图片20150627233807](https://img.prin.studio/images/2015/06/2015-06-27_15-39-05.jpg)](https://img.prin.studio/images/2015/06/2015-06-27_15-39-05.jpg) ，搜索了一下发现原因是 php 禁用了 <span class="theme:arduino-ide lang:default decode:true  crayon-inline ">scandir</span>  函数

依照如下方法启用即可：

### 1.编辑 php.ini

<span class="lang:default decode:true crayon-inline">vim /usr/local/php/etc/php.ini</span>

### 2.查找 scandir

在vim下输入 <span class="theme:arduino-ide lang:default decode:true  crayon-inline ">/scandir</span>  查找，删除 disable_functions 中的 scandir

[![20150710152316](https://img.prin.studio/images/2015/07/2015-07-10_07-33-14.png)](https://img.prin.studio/images/2015/07/2015-07-10_07-33-14.png)

### 3.重启 php-fpm

<span class="lang:default decode:true  crayon-inline ">/etc/init.d/php-fpm restart</span>

[![20150710153609](https://img.prin.studio/images/2015/07/2015-07-10_07-36-26.png)](https://img.prin.studio/images/2015/07/2015-07-10_07-36-26.png)   [![20150606223914](https://img.prin.studio/images/2015/06/2015-06-06_14-39-25.jpg)](https://img.prin.studio/images/2015/06/2015-06-06_14-39-25.jpg)



