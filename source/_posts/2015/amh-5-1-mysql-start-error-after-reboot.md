---
title: 'VPS 软重启后 amh 5.1 mysql 启动错误的解决方法'
date: '2015-07-18 23:26:50'
updated: '2015-07-19 04:21:22'
categories: 技术
tags:
  - MySQL
  - VPS
  - 运维
---

今天咱在 ssh 中执行 reboot 后，发现 wordpress、amh 都连不上 mysql 数据库

<span class="lang:default decode:true  crayon-inline ">amh mysql status</span>  查看发现 mysql 没有在运行，遂 <span class="lang:default decode:true  crayon-inline ">amh mysql start</span>  启动 mysql

结果报！错！了！[![20150711215742](https://img.prin.studio/images/2015/07/2015-07-11_13-57-54.jpg)](https://img.prin.studio/images/2015/07/2015-07-11_13-57-54.jpg) ：

**The server quit without updating PID file**<div class="collapseomatic_content " id="target-id6542">[![图好大](https://ww4.sinaimg.cn/large/ec03501dgw1eu76x1zgmtj20tj0hak99.jpg)](https://ww4.sinaimg.cn/large/ec03501dgw1eu76x1zgmtj20tj0hak99.jpg)
</div>amh 论坛上说有三种可能

1. **df -h**  看磁盘是否有空间；
2. **ls -l /home/usrdata/mysql***  目录是否有权限；
3. 检测 **my.cnf** 配置是否正确(与是否有多余其它的)；

一条一条试过去，咱的硬盘还充足，目录权限也没错

然而窝以为咱没修改过配置所以和 my.cnf 没关系，就没检查，又在 amh 论坛上查找无果 [![20150715224933](https://img.prin.studio/images/2015/07/2015-07-15_14-49-46.jpg)](https://img.prin.studio/images/2015/07/2015-07-15_14-49-46.jpg)

最后在 <del>万策尽きた</del> 的时候，咱抱着最后希望 <span class="lang:default decode:true  crayon-inline ">vim /etc/mysql/my.cnf</span> 了

一看竟然发现里面的 **socket = /var/run/mysqld/mysqld.sock** ！！！[![QQ图片20150621134022](https://img.prin.studio/images/2015/06/2015-06-21_05-40-30.gif)](https://img.prin.studio/images/2015/06/2015-06-21_05-40-30.gif)

woc 原来就是这 sabi [![20150711215742](https://img.prin.studio/images/2015/07/2015-07-11_13-57-54.jpg)](https://img.prin.studio/images/2015/07/2015-07-11_13-57-54.jpg) 估计是装什么模块的时候被重写了

于是 <span class="lang:default decode:true  crayon-inline ">rm -f /etc/mysql/my.cnf</span>  后，<span class="lang:default decode:true  crayon-inline  ">amh mysql start</span>  终于不报错了[![QQ图片20150627233807](https://img.prin.studio/images/2015/06/2015-06-27_15-39-05.jpg)](https://img.prin.studio/images/2015/06/2015-06-27_15-39-05.jpg)

可喜可贺，可喜可贺



