---
title: 'Android 6.0 刷入 Gapps 后出现 “设置向导” 已停止运行 的解决方法'
date: '2016-04-11 19:11:35'
updated: '2016-04-17 13:43:57'
categories: 技术
tags:
  - Android
---

这次给我的 MI3 刷 CM13 的时候，一切都很顺利，应用数据也都是保存了下来。但是由于清空了 `/system` 所以之前安装的 Google Play 服务也需要重新安装了。

在刷入 OpenGapps 的时候，却出现了如标题所示的情况：

![setup wizard stopped](https://img.prinzeugen.net/image.php?di=F02V)

无限弹窗，即时点了确定也会马上再弹一个，完全无法使用。

那么要怎么解决呢？我去网上搜了一下，我也不是第一个 Android 6.0 刷 GAPPS 碰到这种情况的人了。但是由于关键词的关系害我找了很久，在此记录一下，希望可以帮到其他人。

解决方法来自：[机锋论坛](http://bbs.gfan.com/forum.php?mod=viewthread&tid=8089541&page=1#pid294243082)，有删改。

<!--more-->

1. 使用 USB 将手机连接至电脑
2. 开启手机的 USB ADB 调试（检验你的手速的时候到了）
3. 给予 ADB 访问 root 权限（开发者选项 -> ROOT 授权 -> 应用及 ADB）
4. 打开终端（Windows 下：开始 -> 运行 -> cmd）

依次运行如下命令：

```shell
# 打开 ADB Shell 访问
adb shell
# 获取 root 权限
su
# 禁用设置向导
pm disable com.google.android.setupwizard
```

如果运行 `adb shell` 时提示 'adb' is not recognized as an internal or external command, operable program or batch file. 的话，就说明白你没有安装 ADB 驱动。如何安装请自行搜索。我是用的 Android Studio 自带的 ADB（笑）

运行完如上命令后，应该就不会再弹 “设置向导” 已停止运行 了。

然后在手机上打开 设置 -> 应用 -> 点右上角的齿轮 -> 应用权限，把所有 Google 相关的 APP 的权限全部打开。

现在，你可以再连接至 ADB Shell，然后运行：

```shell
pm enable com.google.android.setupwizard
```

这时再去手机上 设置 -> 应用 -> 右上角菜单 -> 显示系统，然后在下面找到设置向导（setup wizard），选权限，把里面两个权限打开。

最后运行（ADB Shell）：
```shell
am start -n com.google.android.setupwizard/.SetupWizardTestActivity 
```

即可重新运行设置向导。

![setup wizard success](https://img.prinzeugen.net/image.php?di=2HUU)



