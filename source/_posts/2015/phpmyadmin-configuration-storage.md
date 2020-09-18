---
title: '配置 phpMyAdmin configuration storage'
date: '2015-07-10 22:52:12'
updated: '2015-07-10 22:54:20'
categories: 技术
tags:
  - 运维
  - 记录
---

lnmp 自动安装 phpMyAdmin 后，默认高级功能是未开启的，会提示：

> The phpMyAdmin configuration storage is not completely configured, some extended features have been deactivated. Find out why.
>  Or alternately go to ‘Operations’ tab of any database to set it up there.

似乎不同pma版本有的是中文提示：**高级功能未全部设置，部分功能不可用。**

嘛，所谓高级功能，就是pma的配置存储，建一个数据库给pma存放配置：

### 1.导入 phpmyadmin 的数据库

在phpMyAdmin的安装目录的 [sql目录](# "lnmp 安装的默认目录是 /home/wwwroot/default/phpmyadmin/sql") 下找到 create_tables.sql 导入到mysql中

### 2.修改 config.inc.php

把以下内容的注释去掉

[![20150709094915](https://img.prin.studio/images/2015/07/2015-07-10_06-49-40.png)](https://img.prin.studio/images/2015/07/2015-07-10_06-49-40.png)

视情况你可能还需要自己添加一些。。反正看一下pma底部的报告差不多就懂了



