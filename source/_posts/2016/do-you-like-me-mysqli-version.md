---
title: '使用 MySQLi 重写 Do you like me'
date: '2016-01-23 07:55:56'
updated: '2016-01-30 19:02:54'
categories: 技术
tags:
  - PHP
---

这次升级 PHP7，一切顺利，到了恢复站点数据的时候，发现[上次搞的](https://prinzeugen.net/do-you-like-me/) “Do you like me?” 不工作了。看了日志发现是 `mysql_connect()` 这个函数的问题。

看了下文档，原来在 PHP7 中全面移除了 `mysql_` 系列函数，转而使用 `mysqli` 或者 PDO。。fuck 劳资皮肤站里都是 mysql_ 系列函数啊啊

上次偷懒用的 LWL12 写的，看来他也没想到这种情况呢。遂使用 mysqli 重写之。

mysqli 改为以面向对象的方式操作数据库，而不是 `mysql_` 系列函数的面向过程，这点倒是挺好的。

不知道为何原来 LWL12 写的版本单独使用了一个表来存投票数，可能是怕效率问题。不过 `SELECT COUNT(*)` 在没有指定 WHICH 的时候效率还是蛮高的，参见：[知乎：mysql select count(*) 与 select count(id) 两个执行效率怎样？](https://www.zhihu.com/question/19641756)

其实也没改多少，另外把建表的 SQL 也顺便封装在文件里了，托管在 [Gist](https://gist.github.com/prinsss/48920748b328bacead1b) 上。

<script src="https://gist.github.com/prinsss/48920748b328bacead1b.js"></script>
