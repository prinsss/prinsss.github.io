---
title:   '已证实 G3258 无法安装 Windows 10130+ （附暂时解决方法'
date:    '2015-07-25 02:06:08'
updated: '2015-08-04 06:17:02'
categories: 技术
tags:
  - Windows
---


### **UPDATE：**已找到完美解决方法，请移步 [https://prinzeugen.net/win10-rtm-enable-g3258-dual-core/](https://prinzeugen.net/win10-rtm-enable-g3258-dual-core/)

- - - - - -

昨天晚上窝就下载了OEM 泄露的 win10 RTM iso，因为 Windows Update 一直升级失败，挂着安装。。然后就出现了错误

> 无法安装 Windows 10
>
> 0xC1900101 – 0X20017
>
> 在 BOOT 操作过程中的 SAFE_OS 阶段，安装失败，出现错误

但是太晚了就懒得折腾也没觉得多大点事儿就睡觉了。今早起来再次安装依然 same error。

窝当时心里挺慌，觉得大概是 iso 的问题，遂下载了 10240 的 iso（NOW ON 10130），然而还是同样的错误。尝试全新安装，USB Boot，HDD Boot 全都是 same error。看来自己是无法解决了，遂使用搜索引擎（已百度搜过但是没有有效解决方法。

搜索了大概 30 min+（Google 关键词 **BOOT SAFE_OS**，百度 pass），看了所有相关的 Microsoft Community 的文章（鹰文），唯一有用的是发现不止窝一个，有很多人有同样的错误。里面的 MS 帮助人员也列出了一些解决措施，包括 set EDB ([Execute Disable Bit](http://www.webopedia.com/TERM/E/Execute_Disable_Bit.html)) to Enable 之类的，但是没什么卵用。

继续 Google 和在 pcbeta 之类的论坛搜索，发现也有人发帖说 Install Windows 10166 on G3258 failed，窝一看就觉得大概是这个了，帖子描述的错误码和症状和窝一模一样而且窝也是 Intel G3258 on E85m motherboard。

遂再次 Google 之，又看了一大堆 MS community 的文，最后锁定搜索关键词为 **Windows 10 G3258**

可以看到有很多出现此问题的人，描述的内容也都是 0xC1900101 – 0X20017 而且10130 及之前都是 no problem

其中最有用的帖子大概是这个：[Windows 10 – new builds won’t boot](https://social.technet.microsoft.com/Forums/en-US/15d85ab2-9fc5-4683-96d6-7770a40284d4/windows-10-new-builds-wont-boot?forum=WinPreview2014Setup)

### 所以目前唯一的解决办法就是在 BIOS 中将 CPU 核心数调为 1

但是将双核 U 调成单核这吃了屎一般的感觉。。只好等 MS 在 29th 的发布了，如果还没有解决的话窝估计要投奔 linux 的怀抱了

目前没有在主用 PC 上装 elementray OS freya 就是怕双亲用不习惯。。想艹黑苹果但是 G3258 好像也会有奇怪的问题。。

真是多灾多难呐， G3258。

<!--more-->

---------

相关阅读（EN）：

[Can’t install Windows 10 build 10162 on Gigabyte H81 motherboard (0xC1900101 – 0x20017)](http://answers.microsoft.com/en-us/insider/forum/insider_wintp-insider_install/cant-install-windows-10-build-10162-on-gigabyte/5be9d4ec-fdc4-47bd-9eb6-5b26806cba59?page=1)

[Win 10 G3258 issue, microcode?](http://answers.microsoft.com/en-us/windows/forum/windows_10-win_upgrade/win-10-g3258-issue-microcode/2b8ba9bd-24e4-4b4a-8d39-abc738a3dec5?page=1)

[Cannot install any builds AFTER 10130 (110158,10159,10162, and now 10166) same error *0xC1900101 – 0x20017*](http://answers.microsoft.com/en-us/insider/forum/insider_wintp-insider_update/cannot-install-any-builds-after-10130/7dd7de32-ce2e-4939-b179-6a187a63502a?tm=1436479147357)

[10162 update and iso install total fail 0xC1900101 – 0x20017](http://answers.microsoft.com/en-us/insider/forum/insider_wintp-insider_update/10162-update-and-iso-install-total-fail-0xc1900101/ab3ba539-4780-42a3-beab-28b5b084acef?tab=question&status=allreplies&auth=1)

[Windows 10 – new builds won’t boot](https://social.technet.microsoft.com/Forums/en-US/15d85ab2-9fc5-4683-96d6-7770a40284d4/windows-10-new-builds-wont-boot?forum=WinPreview2014Setup)

 

**7.29 UPDATE：**

窝已经禁用一核艹上了RTM。。嘛，把单核拉上去也不会有太大拖慢的感觉

总之先这样吧，看看巨硬还会不会有动静

[![20150730083049](https://img.blessing.studio/images/2015/07/2015-07-30_00-32-17.png)](https://img.blessing.studio/images/2015/07/2015-07-30_00-32-17.png) [![20150730083129](https://img.blessing.studio/images/2015/07/2015-07-30_00-32-15.png)](https://img.blessing.studio/images/2015/07/2015-07-30_00-32-15.png)
