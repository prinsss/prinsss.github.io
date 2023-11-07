---
title: 'Eloquent ORM Connection 无法自定义 MySQL 连接端口的解决办法'
date: '2016-03-06 10:31:37'
updated: '2016-04-17 13:44:33'
categories: 技术
tags:
  - 踩坑
  - Laravel
  - PHP
---

这是今天我朋友遇到的问题，网上没有啥解决方法，特此记录。

朋友的 MySQL 运行在 3307 端口，然而他的框架配置文件中没有 Port 的选项（好吧我说的就是 ss-panel），如果在 `db_host` 中填写 `localhost:Port` 这样的格式的话就会报 `SQLSTATE Unknown MySQL server host 'localhost:3307'` 这样的错误。

那么要怎么解决呢？

首先要找到 `.env` 被解析的地方，以 ss-panel 为例是在 `/app/Services/Config.php` 中：

<!--more-->

```
public static function getDbConfig(){
  return [
    'driver'    => self::get('db_driver'),
    'host'      => self::get('db_host'),
    'database'  => self::get('db_database'),
    'username'  => self::get('db_username'),
    'password'  => self::get('db_password'),
    'charset'   => self::get('db_charset'),
    'collation' => self::get('db_collation'),
    'prefix'    => self::get('db_prefix')
  ];
}
```
```
use Illuminate\Database\Capsule\Manager as Capsule;

// Init Eloquent ORM Connection
$capsule = new Capsule;
$capsule->addConnection(Config::getDbConfig());
$capsule->bootEloquent();
```
Eloquent ORM 连接接受一个 array，array 内容即为 .env 中的配置，可以看到，数组中并没有 port 的设置。这确实是 ss-panel 作者的疏忽，我得去提个 Issue。

既然知道了是在哪里初始化的连接，就要去看看 Eloquent 的文档，看看怎么配置端口而不是默认的 3306。

不过我没找到 Eloquent 的具体 setting array（laravel 官方 class 文档倒是有一个，不过语焉不详），只找到了一个同样的问题：https://github.com/laravel/framework/issues/2719

由此可知，只需要在数组中加一个 port 成员即可：`'port' => '3307'`

对于其他使用 Eloquent 的框架同样适用，Laravel 默认的 `.env` 配置文件里也是没有端口配置的。
