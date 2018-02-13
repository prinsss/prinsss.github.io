---
title: 'Windows Update 出现错误 0x800703ed 可能的解决方法'
date: '2018-02-13 11:31:38'
updated: '2018-02-13 11:31:38'
categories: 技术
tags:
  - Windows
---

HAIDOMO，这里是年终总结拖了两个月还没写完，上一篇博文发布于去年十月份的某鸽系博主 **621sama** DE-SU。其实 2018 年的第一篇博文~~原定~~应该是 2017 年的年度总结的，但是由于各种各样的原因，那篇文章到现在还没写完咕咕咕。

最近几天正好遇到了如标题所述的「Windows Update 自动更新时出现错误 `0x800703ed`」的状况，在网上搜索许久，最后历经千辛万苦才终于定位到了问题的根源。特此记录，希望能帮到后来人。

## 0x01 问题描述

虽然我现在已经没多少追 Windows Insider Perview 的热情了，不过最近巨硬推出的那个 Fluent Design 看起来还是挺赞的，就打算在 Windows Update 中升级到最新的 Insider Preview。虽然速度屌慢，但是还是成功地检查到了 Build 17093 的更新并且进入了「正在准备更新」这一阶段。谁曾想等进度跑到 100% 却出现了如下错误：

![error 0x800703ed screenshot](https://img.blessing.studio/images/2018/02/13/DV0b0p7VAAAn_zT.jpg)

这可太他妈的操蛋了。 <!--more-->

## 0x02 尝试定位问题

我最开始有想过是网络问题，也尝试给系统挂上全局代理、在路由器强制让所有流量走代理，结果都是 `0x800703ed` ，因此基本可以排除是网络问题。

随后我在 Google 上搜索 `Windows Update 0x800703ed`，浏览了 Microsoft 中文社区中很多类似的帖子，其中官方人员的回复千篇一律，大部分都是这样的：

- 镜像文件出错，建议重新下载
- 检查 Windows Update 服务是否正常运行
- 禁用所有其他非系统服务再检查更新
- 建议移除各种杀毒软件
- 升级修复各种驱动程序
- 系统文件损坏，插入安装光盘修复
- 下载各种 Repair 工具……

我几乎尝试了他们提到的所有方法，最后都以失败告终。

其他中文社区上也有一些搜索结果，但是毫无帮助，因为他们只会让你：

- 重装系统

对于这种建议，我也想友善地回复一句：**RSNDM**.

中文内容是指望不上了，之后我又在巨硬的洋文支持社区以及其他站点上搜索了老半天，最后终于找到个可能的问题原因：

> 安装了 Windows & Linux 双系统。

……。

![Sticker 288532](https://i.loli.net/2018/02/13/5a82f52fb0971.png)

## 0x03 解决问题

按照那几个网站上的说法（详见页脚的参考链接），如果你在机器上安装了 Windows、Linux 双系统启动，并且使用了其他引导程序（例如 grub），在使用 Windows Update 执行更新操作时就会出现  `0x800703ed` 错误。

**而且我正好如他所述，在机器上安装了 Deepin Linux 与 Windows 的双系统，并且交给 Linux 所在分区上的 grub2 来引导双系统启动。**

到这里基本就可以破案了。之后我把引导程序由 grub2 切换回巨硬的 NT 6.x，重启之后 Windows Update 就一切正常了，并且成功更新至 Build 17093。

![Snipaste_2018-02-13_21-41-29.png](https://img.blessing.studio/images/2018/02/13/Snipaste_2018-02-13_21-41-29.png)

具体切换引导程序的操作我这里就不说了，这种东西网上一搜一大把，注意区分 Legacy BIOS + MBR 环境和 UEFI + GPT 环境就好了。

其实昨天我在切换引导程序时还出了点小插曲：像是不小心把硬盘和 PE U盘 的 MBR **一起弄坏**导致差点进不去任何系统啦、修复 BCD 时总是出现莫名奇妙的问题啦、懵了半小时最后才发现是硬盘活动分区忘记改回来了之类的，要不是昨天手头正好还有个 Deepin 的 LiveCD 我现在早就凉凉了~~（谁让我不会写 grub2 配置，看到 grub rescue 命令行就只有懵逼的份儿呢）~~。

## 0x04 后记

至于为什么使用非 Windows 引导程序就会导致更新时出现 `0x800703ed` 错误，我也只能说不知道啦，鬼知道巨硬是怎么想的。或许是巨硬的系统更新流程里需要使用它自己的引导程序做些神秘的事情吧。

**Windows Update 更新完成后是可以切换回 grub2 引导，完全 OJBK。**

不过需要注意的是，本文提到的解决方法虽然对包括我在内的许多用户都有效，但是到读者你的机器上可能就不行了，毕竟巨硬的报错从来只是给个自己编的错误代码而从来不给具体信息。正如我在标题上写的**「可能的解决方法」**一样，如果「切换引导程序」这个方法对于同样遇到此错误的你不起作用或者对你的设备造成了什么损伤的话，请不要顺着网线过来打我，蟹蟹。

另外预告一下，最近除了年终总结，我应该会再写一篇关于 WSL（*Windows Subsystem for Linux*）的文章，敬请期待咕咕咕。

**参考链接：**

- [Windows 10 Update Error 0x800703ed - Dual Boot with Linux](https://answers.microsoft.com/en-us/windows/forum/windows_10-update/windows-10-update-error-0x800703ed-dual-boot-with/c55815b7-2931-4cd2-a40b-08843f7072b2)
- [Windows 10 upgrade fails with error 0x800703ed](https://www.downtowndougbrown.com/2017/05/windows-10-upgrade-fails-with-error-0x800703ed/)
- [Cannot install Windows 10 Creator update: “something went wrong” error code 0x800703ed](https://superuser.com/questions/1256254/cannot-install-windows-10-creator-update-something-went-wrong-error-code-0x80)