---
title: '解决 AMH 5.1 面板安装的 phpMyAdmin 无法独立登录的问题'
date: '2015-09-13 23:37:23'
updated: '2015-09-13 23:38:37'
categories: 技术
tags:
  - VPS
  - 运维
---


AMH 面板也是国内挺流行的一个 web 主机面板吧，而且相信很多人都是直接在 AMH 面板的软件管理中下载的 PMA。直接通过 AMH 面板访问 PMA 的话就可以登录，但是直接访问 phpMyadmin，登录的话就会出现 `#2002 无法登录 MySQL 服务器` 错误：

[![error](https://img.prin.studio/images/2015/09/2015-09-13_06-58-13.png)](https://img.prin.studio/images/2015/09/2015-09-13_06-58-13.png)

而且自己安装的 phpMyadmin 也同样是 #2002 错误，

这尼玛不科学啊！明明 MySQL 已经启动了，用户名密码都对的！（掀桌

那么这是怎么回事呢？继续阅读之前，窝希望你能够基本了解 [UNIX Socket](https://zh.wikipedia.org/wiki/Unix%E5%9F%9F%E5%A5%97%E6%8E%A5%E5%AD%97) 是个啥。（蛤？你说打不开？翻墙是基本技能。

下面简单一句话介绍一下 UNIX 套接字：**总之就是一种用来与 mysql 数据库通信的工具**。

或许细心的 AMH 面板用户（或者喜欢折腾的），已经发现 AMH 中 mysql 的默认套接字不是 `/tmp/mysql.sock` 而是类似于 `/tmp/mysql-generic-5.5.40.sock` 的，加了版本号的 Socket。

想要知道你的 socket 叫啥？请在 ssh 上 `$ ls -al /tmp` （当然先确保 MySQL 已经启动

AMH 为啥要这样做呢？当然是为了照顾同时使用多版本 mysql 的用户啦，要不然套接字不就串了吗？

所以要怎样做呢？有俩方法：

 

#### 1. 建立软链接

建立一个 `/tmp/mysql.sock` 到 `/tmp/mysql-generic-5.5.40.sock` 的软链接，这样访问 `/tmp/mysql.sock` 就是访问 `/tmp/mysql-generic-5.5.40.sock` 了~

$ ln -s /tmp/mysql-xxxxx.sock /tmp/mysql.sock

上面的 xxxx 记得改成自己的 socket 名称哦

 

#### 2. 修改 phpMyAdmin 配置文件

这个方法是修改 PMA 配置文件中的默认 socket 地址，不是很推荐哦~

打开 `config.inc.php` （没有的话创建一个，这个文件中的设置会覆盖掉 config.default.php 中的设置

AMH 5.1 的这个文件默认在 `/usr/local/amh-5.1/web/phpmyadmin/` 目录下

打开它，找到这一行（或者类似的

$cfg['Servers'][$i]['host'] = "localhost:/tmp/{$_COOKIE['connect_mysql_name']}.sock";

将其中的 <span class="lang:default decode:true crayon-inline ">/tmp/{$_COOKIE[‘connect_mysql_name’]}.sock</span>  改为 <span class="lang:default decode:true crayon-inline ">/tmp/mysql-xxxxx.sock</span>  即可

 

试着访问看看？

[![2](https://img.prin.studio/images/2015/09/2015-09-13_07-29-05-1024x506.png)](https://img.prin.studio/images/2015/09/2015-09-13_07-29-05.png)

蛤蛤，大功告成 [![QQ图片20150913141653](https://img.prin.studio/images/2015/09/2015-09-13_07-32-05.jpg)](https://img.prin.studio/images/2015/09/2015-09-13_07-32-05.jpg)



