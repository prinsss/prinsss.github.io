---
title: 'PHP 命名空间自动加载与实现'
date: '2016-03-18 18:22:15'
updated: '2016-04-17 13:44:12'
categories: 技术
tags:
  - PHP
---

Blessing Skin Server 也经过蛮长时间的开发了，但是类文件都只是简单的堆放在同一个文件夹中。虽然我知道有命名空间这玩意，但是总共就几个类，也不是很有必要。

然而在上周加入了数据对接之后，`includes` 文件夹就开始爆满了：

![includes dir](https://img.prin.studio/legacy/image.php?di=3G97)

这尼玛还怎么忍？必须命名空间走起啊。

然而我只是知道有这玩意，在框架里也用过，但是并不知道如何实现对其的自动加载。

于是我去网上看了一些自动加载的实例，然后自己写了一个自动加载。说实话刚看到的时候还是有点迷的，所以在这里记录一下。由于我的项目是用类名与文件名相同的方式来组织存储的，所以就懒得管 PSR-4 啦（笑）。

<!--more-->

<script src="https://gist.github.com/prinsss/d1af9fefbcbd89996273.js"></script>

`__autoload` 是 PHP 的魔术方法，具体请查看[官方文档](http://php.net/manual/zh/function.autoload.php)。

使用了命名空间之后，`__autoload` 函数得到的 `$classname` 参数值（即需要被加载的类名）就会类似于这样 `Database\AuthmeDatabase`，而我们要做的，就是把用 `\` 组织的带命名空间类名转换为 **目录 + 类名 + 文件后缀**。

```
$filename = $include_dir.str_replace('\\', DIRECTORY_SEPARATOR, $classname) . '.class.php';
```

这样就可以得到文件的绝对路径了：

```
E:\wwwroot\blessing-skin-server\includes\classes\Database\AuthmeDatabase.class.php
```

然后 `require_once` 一下就完成了自动加载。

![used namespace](https://img.prin.studio/legacy/image.php?di=7RIP)

神清气爽
![](https://img.prin.studio/legacy/image.php?di=8WUY)

-------------

参考链接：

[PHP: 命名空间 - Manual](http://php.net/manual/zh/language.namespaces.php)

[PHP命名空间及自动加载](http://yansu.org/2014/01/16/php-namespace-and-autoload.html)

[PHP中的自动加载](https://www.zybuluo.com/phper/note/66447)

