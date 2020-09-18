---
title: '添加 Notepad++ 至右键菜单的几种方法'
date: '2018-08-29 02:35:05'
updated: '2018-08-29 02:35:05'
categories: 技术
tags:
  - Windows
  - 记录
---

作为一名即将开学的计算机系 [准大学生](https://blessing.studio/check-in-2018-07/)，笔记本电脑总归是要有一台的。于是上星期我入手了 [小米游戏本顶配版](https://twitter.com/printempw/status/1030043615983104000)（i7-8750H + 16G + GTX 1066），最近正在重新折腾开发环境，这篇文章要解决的问题也是在此过程中出现的。

至于为什么要买小米的本子，主要是因为它的「游戏本性能 + 商务本外观」这一点正戳中我好球区。不过这几天使用下来，只能说缺点确实不少，有购买意愿的朋友需谨慎。在 Twitter 上搜索 `小米游戏本 from:printempw` 就能看到我发的吐槽简评，如果之后有时间的话也打算专门写篇评测（咕咕咕）。

<!--more-->

回到正题。因为以前家里的电脑是全家共用的所以没什么，不过最近有了自己的电脑，我的软件洁癖就上来了：**有[绿色版](https://zh.wikipedia.org/wiki/%E7%B6%A0%E8%89%B2%E8%BB%9F%E9%AB%94)（便携软件，Portable Application）的绝不用安装版，国产软件一律扔沙盒运行。**

看起来有点偏执，不过我就属于那种想把自己设备中的一切纳入可控范围内的人。Windows 在这点上就很讨厌，尤其是注册表的设计，比类 Unix 系统难管理了不是一点半点。在手机上也是一样，不能解锁 bootloader 的 Android 机器我绝对不会购买，AppOps、Magisk、[存储重定向](https://play.google.com/store/apps/details?id=moe.shizuku.redirectstorage) 等工具更是必备。虽然我也没偏执到「每条指令运行都需要我的许可」那种程度，不过至少，我的设备必须听我的话，我说什么不能做那就是不能做，你他娘的不能给我自作主张（比如 Windows [广受诟病的自动更新机制](https://www.zhihu.com/question/271414438)、某些臭名昭著的国产软件扫描用户硬盘等）。为什么？**因为是我在用电脑，不是电脑用我。**

好了言归正传（没错，本博客就是有在进入正题之前瞎扯一通的习惯）。

[Notepad++](https://notepad-plus-plus.org/) 是一款我很喜欢的文本编辑器，除了写代码和写文章外的一般文本编辑工作我都是使用它完成的，配置新电脑时自然不能少了它。我下载的是 Portable 便携版，不过也正因如此，原本在 Installer 中通过选项可以添加的 *Edit with Notepad++* 右键菜单项也没有了（此操作需要写注册表）。

因为这个右键菜单还蛮好用的，所以我打算把它找回来。

![npp-context-menu-demo](https://img.prin.studio/images/2018/08/29/npp-context-menu-demo.png)

## 方法一：使用官方提供的 NppShell.dll

此方法来自 Notepad++ 的官方 Wiki（见底部参考链接）。

添加右键菜单项需要修改注册表，除了手动修改注册表，Notepad++ 官方还提供了一个 DLL 文件用于注册以及卸载右键菜单。如果你使用的是安装版，那么在程序目录下应该会有一个 `NppShell_06.dll` 文件（不同版本下文件名中的数字可能会不同）；如果没有或者是便携版，那么请在这里下载该文件：

https://github.com/notepad-plus-plus/notepad-plus-plus/tree/master/PowerEditor/bin

上面的地址是 Notepad++ 官方 GitHub 仓库中提供的预编译 DLL，32 位系统的用户请下载 `NppShell.dll`，64 位系统的请下载 `NppShell64.dll`。不要吐槽为啥这文件四年没更新了，因为人家确实是四年没更新了，Wiki 原文中提供的链接还是八年前的呢（笑）。

下载后，打开一个具有管理员权限的 `cmd.exe` 或者 PowerShell，cd 到 Notepad++ 的安装目录（直接指定 DLL 的绝对路径是没用的，必须在程序目录下运行），并运行如下命令（文件名自行替换）：

```powershell
regsvr32 /i NppShell64.dll
```

运行后会弹出一个对话框，直接点 OK 就可以了。

如果没给管理员权限，会报错「模块 NppShell64.dll 已加载，但对 DllRegisterServer 的调用失败」。

![regsrv32-i-nppshell-dll](https://img.prin.studio/images/2018/08/29/regsrv32-i-nppshell-dll.png)

如果要删除右键菜单，请运行：

```powershell
regsvr32 /u NppShell64.dll
```

如果你不会运行这些命令也没事，将以下内容使用记事本保存为 `.bat` 文件，放到 Notepad++ 的安装目录下，右键「以管理员身份运行」即可（此脚本修改自：[Notepad++ 添加右键打开菜单 - 成功志](http://www.ok12.net/?post=31)）。

```cmd
@Echo Off
cd /d %~dp0
title Notepad++ 右键菜单添加/删除工具

SetLocal EnableDelayedExpansion
echo 1. 添加 Notepad++ 右键菜单
echo ------------------------
echo 2. 删除 Notepad++ 右键菜单
echo ------------------------

Set /p u=请输入数字并按 Enter 确定：

If "%u%"=="1" Goto regnpp
If "%u%"=="2" Goto unregnpp

:regnpp
regsvr32 /i NppShell64.dll
exit

:unregnpp
regsvr32 /u NppShell64.dll
exit
```

## 方法二：手动修改注册表

如果你不想用上面的那个方法，也可以自己手动修改注册表。

修改注册表添加右键菜单项有两种方法，这里先介绍简单点的方法。

将以下内容保存为 `.reg` 文件，双击运行即可（其中可执行文件路径和菜单项名称请自行替换）：

```
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\*\shell\NotePad++]
@="Edit with &Notepad++"
"Icon"="C:\\Portable\\notepad-pp\\notepad++.exe"

[HKEY_CLASSES_ROOT\*\shell\NotePad++\Command]
@="C:\\Portable\\notepad-pp\\notepad++.exe \"%1\""
```

如果要删除右键菜单，也是一样的道理：

```
Windows Registry Editor Version 5.00

[-HKEY_CLASSES_ROOT\*\shell\NotePad++]
```

## 方法三：手动修改注册表 - 使用 Context Menu Handler

Windows 下添加项目至文件的右键菜单有两种方式，一种是上面提到的直接往注册表 `HKEY_CLASSES_ROOT\{file_type}\shell` 里面加东西，另外一种更牛逼一点，需要注册 Context Menu Handlers。

怎么个牛逼法呢？简单来说，Windows 会在显示右键菜单之前调用注册的 handler，handler 可以动态地修改右键菜单的内容，从而实现更加灵活的自定义，而不像上一种方法那样只能写死（比如说各种压缩软件在不同文件上的右键菜单项文本都是不同的）。有兴趣的同学可以去看看 [MSDN 文档](https://msdn.microsoft.com/en-us/library/windows/desktop/cc144169%28v=vs.85%29.aspx)（反正我对 Win32 开发是没兴趣，不仅文档繁杂，Windows 的注册表也让我很讨厌，看着就烦）。

回到正题。开头提到的 NppShell.dll 也是使用 Context Menu Handler 实现的，我从 [源码](https://github.com/notepad-plus-plus/notepad-plus-plus/blob/master/PowerEditor/src/tools/NppShell/src/NppShell.cpp) 里把其添加的注册表项扒出来了，使用方法和上一节一样（如果你是 32 位的系统，请将下面的 `{B298D29A-A6ED-11DE-BA8C-A68E55D89593}` 替换为 `{00F3C2EC-A6EE-11DE-A03A-EF8F55D89593}`）：

```
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\CLSID\{B298D29A-A6ED-11DE-BA8C-A68E55D89593}]
@="ANotepad++64"

[HKEY_CLASSES_ROOT\CLSID\{B298D29A-A6ED-11DE-BA8C-A68E55D89593}\InprocServer32]
@="C:\\Portable\\notepad-pp\\notepad++.exe"
"ThreadingModel"="Apartment"

[HKEY_CLASSES_ROOT\CLSID\{B298D29A-A6ED-11DE-BA8C-A68E55D89593}\Settings]
"Title"="Edit with &Notepad++"
"Path"="C:\\Portable\\notepad-pp\\notepad++.exe"
"Custom"=""
"ShowIcon"=dword:00000001
"Dynamic"=dword:00000001
"Maxtext"=dword:00000019

[HKEY_CLASSES_ROOT\*\shellex\ContextMenuHandlers\ANotepad++64]
@="{B298D29A-A6ED-11DE-BA8C-A68E55D89593}"
```

如果你要删除右键菜单，同理：

```
Windows Registry Editor Version 5.00

[-HKEY_CLASSES_ROOT\*\shellex\ContextMenuHandlers\Notepad++64]
[-HKEY_CLASSES_ROOT\CLSID\{B298D29A-A6ED-11DE-BA8C-A68E55D89593}]
```

## 方法四：使用「发送到」快捷方式

看到这里，有些人可能会吐槽：你这都改注册表了，还绿色软件个毛线啊！

呃，好吧，无法反驳。🤔

对于那些不愿意修改注册表，又想通过右键菜单便捷打开 Notepad++ 的选手，这里有一个不错的方法：使用 Windows 自带的「发送到」功能。

首先在资源管理器的地址栏中输入 `shell:sendto` 并回车，你会被重定向至 `C:\Users\{username}\AppData\Roaming\Microsoft\Windows\SendTo` 目录。在此目录下建立一个到 `notepad++.exe` 的快捷方式，你就可以通过右键菜单中的「发送到」实现同样的功能。

虽然比直接添加右键菜单要多操作一步，不过我倒觉得这样更简单优雅。另外，这一技巧也同样适用于其他应用程序，大家可以记一下哦。;)

![npp-send-to-menu](https://img.prin.studio/images/2018/08/29/npp-send-to-menu.png)

## 总结

我对 Win32 开发不熟，上面那些都是现学现卖的，如有口胡还请告知。

参考链接：

- [Adding Notepad++ to the context menu of the Windows file manager](http://docs.notepad-plus-plus.org/index.php/Explorer_Context_Menu)
- [给 Notepad++ 加右键菜单带图标](https://www.cnblogs.com/mq0036/p/3815728.html)
- [为 Notepad++ 添加带图标的右键菜单](http://www.catmee.com/add-context-menu-for-notepad-plus-plus/)
- [notepad-plus-plus/PowerEditor/src/tools/NppShell/src/NppShell.cpp](https://github.com/notepad-plus-plus/notepad-plus-plus/blob/master/PowerEditor/src/tools/NppShell/src/NppShell.cpp)
- [檔案總管右鍵選單開啟免安裝版 Notepad++](http://blog.darkthread.net/post-2017-06-05-open-notepad-with-contextmenu.aspx)
