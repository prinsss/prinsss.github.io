---
title: '使用 ADB Shell 刷入 Recovery'
date: '2016-10-27 22:07:10'
updated: '2016-10-27 22:07:10'
categories: 技术
tags:
  - Android
---

众所周知 MTK（联发科）的大部分机器都是没有 `fastboot` 模式的，也就意味着不能进行普通的依赖于 `fastboot` 系列命令的线刷模式。普通来讲这也没啥特别大的影响，毕竟刷 `recovery` 可以直接系统里拿到 root 后用工具刷，救砖有 MTK 专用的线刷工具~~（这玩意的驱动坑的不行）~~。

但是，在一些**神秘**的状况下，我~~们~~有可能会被没有 `fastboot` 的情况下坑到。

这次我想刷的是「朵唯 iSuper S1」，用的是 MTK6589 芯片组。按照惯例刷机之前首先要把 `Recovery` 换掉以刷入第三方 ROM 包。照理来说这块是没有问题的，但是不知道为什么，市面上的 Root 工具能够让手机拿到 Root 权限，但是在手机上安装权限管理应用时均告失败，也是迷的不行。

明明 Root 权限都已经拿到了却刷不了 Rec，这也太吃瘪了吧！然而没有 MTK 机子也不能用 fastboot 刷 rec，专门的线刷工具又太难用。。就在这时，我突然想到了一个命令 —— `dd`。

<!--more-->

> dd 是一个 Unix 和类 Unix 系统上的命令，主要功能为转换和复制文件。
> 
> 在Unix上，硬件的设备驱动（如硬盘）就像普通文件一样，出现在文件系统中；只要在各自的驱动程序中实现了对应的功能，dd 也可以读取自和/或写入到这些文件。这样，dd 也可以用在备份硬件的引导扇区、获取一定数量的随机数据等任务中。

以上摘自中文 [WikiPedia](https://zh.wikipedia.org/wiki/Dd_(Unix))。

虽然我无法在手机上拿到 root 权限（没有权限管理应用），但是我能在 `ADB Shell` 里拿到呀：

```shell
printempw@prinzeugen ~ $ adb shell
shell@android:/ $ su
su # 切换到 root 用户
shell@android:/ # 
```

那么既然拿到了 `root` 的 shell 访问权，为什么不能用 `dd` 命令覆写 `recovery` 呢？当然真正运行之前我还是查了一下这种方法的，不过似乎大部分都是使用 `dd` 从手机里把 `recovery` 备份出来的。。至于国内论坛上那些所谓「通过 ADB 命令刷入 recovery.img 的方法」，都是瞎 TM 扯淡，整篇文章里 adb 起到的作用就是：

```
adb reboot bootloader # 重启至 fastboot 模式
```

嘛，要说他文不对题也不至于，毕竟人家的标题是「使用 ADB **命令**」嘛（笑），所以我在本文标题上清楚的写上了使用 `ADB Shell` 进行操作。

闲话休提。于是我抱着作死的心态运行了：

```
shell@android:/mnt/sdcard2 # dd if=/mnt/sdcard2/recovery.img of=/dev/recovery
dd if=/mnt/sdcard2/recovery.img of=/dev/recovery
11916+0 records in
11916+0 records out
6100992 bytes transferred in 1.626 secs (3752147 bytes/sec)
```

其中 `if` 参数是要刷入的 recovery 文件所在的位置，`of` 参数是 recovery 所在的分区，对于 MTK 来说是在 `/dev/recovery` 下，其他平台可能不是这个所以要注意哦（其他平台也用不到这种憋屈的方法吧）。

从上面的回显可以看到 `dd` 命令已经成功把 recovery 覆写掉了，那么下面就是见证奇迹的时刻辣！

```
printempw@prinzeugen ~ $ adb reboot recovery
```

![](https://img.prinzeugen.net/image.php?di=15FA) 大成功！

---------------------

嘛，虽然没有贴图感觉没有说服力就是啦。不过我写这篇文章的目的也就是想要告诉后来遇到这种尴尬情况的人（如果有的话）还有这种方法可以用于刷入 recovery。

以上。

