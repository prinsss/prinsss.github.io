---
title: 'Linux 安装 memcached 并启用 Wordpress memcache 缓存'
date: '2015-07-29 06:57:49'
updated: '2015-08-29 00:35:33'
categories: 技术
tags:
  - Linux
  - WordPress
---


首先先来理一下 memcache 和 memcached 的区别：

> [Memcache](http://memcached.org/) 是一个自由和开放源代码、高性能的、具有分布式对象的缓存系统。它可以用来保存一些经常存取的对象或数据，加速动态 web 应用程序，减轻数据库负载。保存的数据像一张巨大的 HASH 表，该表以键值对的方式存在内存中。

Memcache 是这个项目的名称，memcached 是这个项目的主程序名称也是守护进程。还有一个 memcached 是 php-extension。

环境：*Ubuntu 14.04.2 LTS (GNU/Linux 3.13.0-57-generic i686) with lnmp*

### 一、安装 memcached 服务端

网上的都是下载源码本地编译的，但是可以 apt-get 的话为什么不用呢？

apt-get install memcached memcached -d -m 128 -u root -p 11211 #启动 memcached 服务

参数说明：

*-p  侦听的端口，默认为 11211*  
*-m  使用内存大小，默认为 64m*  
*-d  作为守护进程启动*

可以用 <span class="lang:sh decode:true crayon-inline">ps -ef|grep memcached</span>  或者 <span class="lang:sh decode:true  crayon-inline">telnet 127.0.0.1 11211</span>  查看 memcached 服务状态

### 二、安装 PHP memcached 扩展

这个就没有那么方便了，要自己编译，在[这里](http://pecl.php.net/package/memcached)选一个版本下载解压（注意 memcached 和 memcache 两种 php 扩展的区别，推荐 php-memcached 

wget http://pecl.php.net/get/memcached-2.1.0.tgz tar -xvf memcached-2.1.0.tgz

开始编译：（机灵点儿，下面 php 路径自己看着改

/usr/local/php/bin/phpize ./configure --with-php-config=/usr/local/php/bin/php-config make && make install

编译成功后会输出

> Installing shared extensions:     /usr/local/php/lib/php/extensions/no-debug-non-zts-20090626/

ls 一下这个目录，

[![20150726203222](https://img.blessing.studio/images/2015/07/2015-07-28_14-47-15.png)](https://img.blessing.studio/images/2015/07/2015-07-28_14-47-15.png)

多了一个编译出来的 memcache.so ，mv 到你的 *php extension dir* 里去（可以在 phpinfo() 中查看

然后在 php.ini 的最后加入一句

extension = memcache.so

重启 php-fpm 和 nginx 后就可以在 phpinfo() 中看到扩展信息了

[![phpinfo](https://img.blessing.studio/images/2015/07/2015-07-28_14-51-15.png)](https://img.blessing.studio/images/2015/07/2015-07-28_14-51-15.png)

### 三、在 WordPress 中启用 memcache 缓存

推荐 W3-Total-Cache，运行 W3TC 的 compatibility check 可以看到 memcache 已经安装成功可以使用了

[![w3tc_memcache](https://img.blessing.studio/images/2015/07/2015-07-29_03-14-37.png)](https://img.blessing.studio/images/2015/07/2015-07-29_03-14-37.png)

 

具体设置就不说了，自己看着改吧。

（如果跟窝一样无法忍受 W3TC 的破图标的话就看一下[这一篇](https://prinzeugen.net/way-to-change-icon-of-w3-total-cache-in-admin-menu-sidebar/)吧



