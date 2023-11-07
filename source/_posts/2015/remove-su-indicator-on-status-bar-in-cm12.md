---
title: '去除 CM12 通知栏的 SU Indicator'
date: '2015-08-18 17:57:57'
updated: '2015-08-29 00:34:46'
categories: 技术
tags:
  - Android
  - 踩坑
---

如果你使用的是 CM12 并且长时间使用 root 权限的话，一定会发现通知栏上有一个难看的 # 符号即 SU Indicator，超级用户权限指示器。这对于强迫症用户简直就是持久性伤害 max 啊 qwq

[![CM12_Pound_Symbol](https://img.prin.studio/images/2015/08/2015-08-22_02-21-53.png)](https://img.prin.studio/images/2015/08/2015-08-22_02-21-53.png)

那么要怎样去掉呢？（之前忘记截图了，只好网上找了张图贴上来 qwq

### 1. 使用 Xposed

有一个 Xposed 模块叫 Disable SU Indicator，试用于 CM12，有需要可以自行搜索。但是现在 Android 5.1.1 的 Xposed 框架很不稳定，很有可能会出现 boot loop 无限重启的情况，不值得。那怎么办呢？

### 2. 使用 SuperSU 替换 CM 默认的 root 权限管理

到处搜索的时候找到了这篇文章：[CM12: How to Remove the # Symbol in the Status Bar](http://www.androidexplained.com/cm12-remove-pound-symbol-status-bar/)，里面讲述了一种用 SuperSU 替换 CM 自带 root 授权管理的方法，不过他使用的是卡刷 SuperSU 的方法。

但是经过窝亲自测试，直接安装 SuperSU 的 apk，他就会自动到 recovery 安装二进制文件（TWRP 等 Recovery）。窝的是 MI3 刷的 CM12，recovery 就是 TWRP，亲测成功。如果是其他不受支持的 recovery 的话那就请卡刷吧~

[![Screenshot_2015-08-22-10-32-23](https://img.prin.studio/images/2015/08/2015-08-22_02-39-53.png)](https://img.prin.studio/images/2015/08/2015-08-22_02-39-53.png)

自动重启后，使用 root 权限就没有难看的 # 号啦~  (ノﾟ∀ﾟ)ノ



