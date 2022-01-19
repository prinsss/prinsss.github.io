---
title: 'WSL 配置指北：打造 Windows 最强命令行'
date: '2018-09-08 15:07:41'
updated: '2018-09-08 15:07:41'
categories: 技术
tags:
  - WSL
  - CLI
  - Windows
---

在两年前的八月，Microsoft 正式发布了 Windows 10 Anniversary Update 周年更新（它还有着 RS1，Version 1607，Build 14393 等一大堆别名）。其中最让包括我在内的众多开发者感到兴奋的特性之一，就是 WSL（Windows Subsystem for Linux，当时还叫 Bash on Ubuntu on Windows）的正式加入。

**在 Windows 上原生运行 Linux 可执行文件，牛逼疯了！**

然而 Bug10 也不是浪得虚名，原本只提供给 Insider 的 WSL 在正式发布后依然问题多多（不仅 zsh、tmux 等工具无法使用，网络相关的操作更是一概欠奉，还有各种各样 [奇妙的 BUG](https://twitter.com/i/status/927862325280772096)），基本没有可用性，我在尝鲜了一段时间后也不得不重回 Cygwin 的怀抱。不过好消息是，在之后的更新中，[这些 BUG 都已被逐一消灭](https://blogs.msdn.microsoft.com/commandline/2017/04/11/windows-10-creators-update-whats-new-in-bashwsl-windows-console/)。

经过了两年的发展，WSL 已经[足够成熟](https://twitter.com/i/status/927898980385677312)，我也是时候完成这篇[一咕再咕](https://twitter.com/i/status/928656863310200832)的博文了。

（开学在即，仓促成文，如有谬误，还请指正。）

![get-wsl](https://img.prin.studio/images/2018/09/08/get-wsl.png)

<!--more-->

## 1. 我理想中的命令行界面

既然~~违反广告法~~取了这么个标题，那我自然得先描述一下我的目标，也就是我理想中的命令行界面应该是什么样子的（如果你不清楚命令行的概念，可以看看我之前写的 [这篇文章](https://prinsss.github.io/the-difference-between-cli-terminal-shell-tty/)）：

- **好看**（配色、字体可以自由设定）；
- 支持 UTF-8 字符的输入与显示；
- 支持常见的 *NIX 命令行工具（cat、grep、awk 等）；
- 自动补全、语法高亮、历史记录；
- 完善的复制粘贴支持；
- 互操作性（共享文件系统、网络栈，可调用 Win32 程序）；
- 支持常用的脚本语言（PHP、Python、Node.js 等）；
- 包管理器，以及其他各种常用软件的支持；
- 快速呼出（快捷键、右键菜单入口）。

然而遗憾的是，Windows 上的命令行一直以来都很微妙。

## 2. 难用的 Windows 命令行

停停停，那边的 PowerShell 爱好者 ，咱别动粗成吗？

首先我要对标题做出一些订正，Windows 原生命令行其实也可以不那么难用。虽然 cmd.exe 是公认的难用到反人类（毕竟是用来兼容 DOS 的老古董），但后来推出的 PowerShell 已经足够强大且现代化，能够称得上是一个成熟的命令行 Shell 了。**如果你愿意学习的话，PowerShell 几乎可以满足你对命令行的所有期待。**这一点可以参见：[Is PowerShell ready to replace my Cygwin shell on Windows?](https://stackoverflow.com/a/573861)

但是，PowerShell 与 Bash 等类 Unix 系统上的 Shell 程序几乎是两个完全不同的世界。不仅语法不同，其平台上各类常用的命令行工具也基本不一致（比如类 Unix 系统中的 `grep` 对应 PowerShell 中的 `Select-String`，`uniq` 对应 `Select-Object -Unique` 等）。往深了说，他们的系统设计理念都是不一样的，比如很多人推崇的 [Unix 哲学](https://zh.wikipedia.org/wiki/Unix%E5%93%B2%E5%AD%A6)，在 Windows 上就基本不见踪影；而 COM 等概念也是 Windows 独一份。

![manga-system-admin-girl-sp-wsl](https://img.prin.studio/images/2018/09/08/manga-system-admin-girl-sp-wsl.png)

*▲ 图片来源：[シス管系女子 BEGINS 特別編 まんがでわかる WSL](https://system-admin-girl.com/comic/begins/sp-wsl/)*

当然，我无意在此挑起操作系统间的圣战。Windows 和类 Unix 系统中的命令行哪个好用，见仁见智。不过对于包括我在内的很多用户都认为 Windows 命令行不怎么好用，仅此而已。

回到正题。

**虽然 Windows 的命令行一直遭人诟病，但是人家的图形界面牛逼啊。**于是无数工程师前赴后继，试图在 Windows 上创造出不输给类 Unix 系统的命令行体验 —— 却绝大多数以失败告终。曾经努力过的人，或者回到可爱的 Linux 上，或者进入高贵冷艳的 macOS 的世界。其中有先辈留下了 Cygwin、GnuWin32 等工具集，让我们可以在 Windows 下使用类 Unix 系统中常见的命令行工具，成为了不少 Windows 用户的救赎。

然而，就当大家都觉得「也就这样了」的时候，Microsoft 出人意料地站了出来。

带着他新鲜出炉的 WSL。

## 3. Windows Subsystem for Linux，参上！

大家都把 WSL 吹得这么牛逼，那 WSL 究竟是个什么玩意儿呢？

简单来说，WSL 是一个 **[兼容层](https://zh.wikipedia.org/wiki/%E5%85%BC%E5%AE%B9%E5%B1%82)**，有点像反过来的 Wine。

----------

首先，我问个问题，为什么 Linux 上的程序无法在 Windows 上运行呢？

了解过一点操作系统原理的同学应该都知道，这是 Windows 与 Linux 的内核提供的接口不同（系统调用、API 等）导致的。举个栗子，我们想知道某目录下的内容，在 Linux 下我们会使用 `ls` 命令，而在 Windows 下我们会使用 `dir` 命令。

当我们在 Linux 上执行 `ls` 命令，`ls` 会调用 `getdents` 这个系统调用，Linux 内核收到请求，将目录的内容返回给应用程序；当我们在 Windows 上执行 `dir` 命令，`dir` 会调用 `NtQueryDirectoryFile` 这个 API，NT 内核收到请求，将目录的内容返回给应用程序。虽然系统不同，但基本上都是一个道理。

然而，当我们把 Linux 上的应用程序拿到 Windows 上运行时，应用程序和内核就双双懵逼了。比如 `ls` 会尝试调用 `getdents` 系统调用（理想化的情况下，暂不考虑可执行文件格式等问题），Windows 的 NT 内核一看，心说：「这他娘的什么东西，老子不认识啊，啥情况啊」，`ls` 也想：「尼玛，内核怎么不回话啊，咋回事儿啊」……两边语言不通，应用程序自然无法正确执行。

但是有了 WSL，情况就不一样了。

依然拿 `ls` 举例，当我们在 WSL 中运行 `ls` 命令时，`ls` 会调用 `getdents` 系统调用（这个系统调用接口是 WSL 提供的，Windows 本身并没有这个接口），WSL 收到这个请求，明白了应用程序是想要知道目录的内容，**于是把 Linux 的系统调用转换为 NT API `NtQueryDirectoryFile`**。NT 内核收到 WSL 的请求，将目录的内容返回给 WSL，WSL 再把返回的内容包装好后返回给 `ls`。

也就是说，WSL 在 Linux 应用程序与 Windows NT 内核之间起到了**翻译者**的作用。很简单的道理，既然 NT 内核无法理解 Linux 应用程序的 POSIX 系统调用，那就弄个翻译来将 POSIX 系统调用实时转换为 NT 内核能理解的 API 调用，突出一个见人说人话、见鬼说鬼话。

只要实现了足够多的系统调用翻译，那么理论上 WSL 可以完全模拟成一个 Linux 内核。

----------

相信各位都听说过鼎鼎大名的 Cygwin。同样是能让 Linux 应用程序运行在 Windows 上，WSL 和 Cygwin 有什么不同呢？其实差别还是挺大的。

虽然 Cygwin 提供了完整的 POSIX 系统调用 API（以运行库  `Cygwin*.dll` 的形式提供），但其依然工作在 User Mode；而 WSL 中的 Linux 应用程序进程会被包裹在一个叫做 Pico Process 的东西里，这个东西里发出的所有系统调用请求都会被直接送往 Kernel Mode 中的 `lxcore.sys` 与 `lxss.sys` 处理。

同样是将 POSIX 系统调用转换为 Windows 中的 API，Cygwin 是转换成 Win32 API 的调用（因为它架设在 Win32 子系统上，很多内核操作受限于 Win32 的实现，比如 `fork`），而 WSL 则是转换为更底层的 NT API 调用（WSL 是与 Win32 平行的子系统，直接架设在 NT 内核上，可以通过 NT API 原生实现 `fork` 等系统调用）。

![wsl-architecture](https://img.prin.studio/images/2018/09/08/wsl-architecture.png)

*▲ WSL 架构示意图。图片来源：[Windows for Linux Nerds](https://blog.jessfraz.com/post/windows-for-linux-nerds/)*

最重要的一点：如果使用 Cygwin，Linux 应用程序的源码必须 link 至 Cygwin 运行库（`Cygwin*.dll`），**修改源码重新编译后才能在 Windows 下运行**。这些重新编译后的 Linux 应用程序在调用 POSIX API 时不会直接去请求内核，而是会去调用 Cygwin 运行库，由运行库翻译成 Win32 API、执行调用后返回结果。这也就意味着，重新编译后的应用程序需要依赖 Cygwin 运行库才能正常运行（有时候你会碰到的「缺少 `Cygwin1.dll`」报错就是这个原因），而且这样编译出来的可执行程序是纯正的 Win32 PE 格式封装，只能在 Windows 上运行。

而在 WSL 下，我们可以直接运行未经任何修改的 ELF 格式 Linux 可执行程序。

![ls-exe-in-cygwin](https://img.prin.studio/images/2018/09/08/ls-exe-in-cygwin.png)

*▲ Cygwin 目录下，被编译成 Win32 可执行程序的 Linux 应用程序们。*

最后总结一波：

WSL 就像是一个翻译官，就算那些未经修改的 Linux 应用程序们操着一口纯正的 POSIX 系统调用语法，WSL 也能快速准确地将其翻译为 NT 内核能听懂的 API 调用；

而那些使用了 Cygwin 重新编译后的 Linux 应用程序，就像是改造人一样变成了 Win32 应用程序的形状，还被套了个翻译机。程序自己（源码中）说的是 POSIX，经过翻译机（Cygwin 运行库）之后就变成 Win32 API 调用了，这样 NT 内核也能听得懂。

但是每次添加新程序都要改造，多麻烦啊，还是 WSL 原生态更健康（笑）。

----------

以上只是我对 WSL 的粗浅解释，其具体实现原理可以参考官方博客上的 [这一系列文章](https://blogs.msdn.microsoft.com/wsl/2016/04/22/windows-subsystem-for-linux-overview/)。

## 4. 安装 WSL，拥抱可爱的 Linux

好了不说废话，让我们开始安装 WSL。**注意，WSL 仅支持 64 位系统，且本文中所描述的安装方法仅适用于 Windows 10 Fall Creators Update**（秋季创意者更新，RS3，Version 1709，Build 16299）及以上版本。

**第一步**，打开「控制面板」中的「程序与功能」，点击左侧边栏的「启用或关闭 Windows 功能」选项，在弹出的窗口中勾选「适用于 Linux 的 Windows 子系统」，然后点击确定（可能需要重启）。

如果你懒得用 GUI，也可以直接在 PowerShell 中以管理员权限执行命令：

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
```

![enable-windows-optional-feature](https://img.prin.studio/images/2018/09/08/enable-windows-optional-feature.png)

**第二步**，打开 Microsoft Store，搜索「WSL」。挑选一个你喜欢的 Linux 发行版，然后点击安装。（截至目前，商店中可用的发行版有 Ubuntu、openSUSE、SUSE Linux Enterprise Server、Debian 以及 Kali Linux。）

![microsoft-store-wsl](https://img.prin.studio/images/2018/09/08/microsoft-store-wsl.png)

**第三步**，在开始菜单中找到你刚刚安装的发行版，打开它。等待几分钟的初始化过程，设定好用户名与密码后（不需要与 Windows 的相同，用过 Linux 的选手应该都懂的）就会自动进入 Linux 环境。

至此，你已经完成了 WSL 的安装。

你也可以同时安装多个发行版，它们的数据都是独立的，互不影响。

![initialize-wsl](https://img.prin.studio/images/2018/09/08/initialize-wsl.png)

## 5. 使用更专业的终端模拟器

我猜你现在正在对上面那个窗口发呆。

**—— 这个新宋体他娘的是个什么情况？**

如果你正在使用中文 Windows 系统，而且之前并没有修改过 Win32 Console 的默认配置，那么你的 WSL 终端默认就会是这样的。新宋体，就是这么 Hardcore。惊不惊喜，意不意外？

好吧不开玩笑，Windows 这个控制台窗口就是很多人讨厌它的原因之一，难用又难看。丑这一点倒还有解决方法（经过一番设置后还算能看，我以前就写过一篇关于 [自定义 Windows 控制台字体](https://prinsss.github.io/windows-change-cmd-font/) 的文章），难用却是实打实的。尽管 Win10 上的控制台已经改进了不少（可以看看 Microsoft 的官方博客：[Windows Command Line Tools For Developers](https://blogs.msdn.microsoft.com/commandline/)），但其依然是最难用的终端模拟器之一，或许没有之一。

因此，为了实现我们的目标，一个更强大的终端模拟器是必须的。

> 终端模拟器是什么？为了这个回答这个问题，我专门写了一篇文章，[去看看吧](https://prinsss.github.io/the-difference-between-cli-terminal-shell-tty/)。:P

我个人比较推荐的终端模拟器有：

- **[wsl-terminal](https://github.com/goreliu/wsl-terminal)**

  专门为 WSL 开发的终端模拟器，基于 mintty 与 wslbridge，稳定易用。

- **[ConEmu](https://conemu.github.io/)**

  Windows 上的老牌终端模拟器，功能极为强大，要啥有啥。

- **[Hyper](https://hyper.is/)**

  基于 Electron 的跨平台终端模拟器，好看和可扩展性是卖点，[BUG 不少](https://github.com/zeit/hyper/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc)。

还有其他各种各样的终端模拟器，选个自己喜欢的就好。反正不管选哪个，都比默认的那玩意儿要好用。🌚

另外，设定终端模拟器的 Shell 入口时有个坑，需要注意一下（参见下文 6.4）。

![my-terminals](https://img.prin.studio/images/2018/08/22/my-terminals.png)

*▲ 我正在使用的终端，wsl-terminal 与 Hyper。~~好看是第一生产力。~~*

## 6. 让我们更深入一些

以下是 WSL 的一些优化技巧。

### 6.1 使用软件源镜像

由于众所周知的原因，各大发行版默认的软件源在中国大陆的访问速度都很屎。

我目前使用的是 [清华大学的 Ubuntu 镜像源](https://mirror.tuna.tsinghua.edu.cn/help/ubuntu/)。

### 6.2 安装 zsh 与 oh-my-zsh

想要快乐地使用命令行，一个趁手的 Shell 是必不可少的。

我个人习惯使用 zsh，安装步骤不再赘述。[我的自定义 oh-my-zsh 主题](https://gist.github.com/prinsss/1ae3b8ae3091a6cfd65a22e1872af7ab)：

```shell
# ~/.oh-my-zsh/custom/themes/robbyrussell-ascii.zsh-theme
# Modified from robbyrussell, the default theme of oh-my-zsh.
# > blog git:(source) x $

local ret_status="%(?:%{$fg_bold[green]%}>:%{$fg_bold[red]%}>%s)"
PROMPT='${ret_status} %{$fg[cyan]%}%c%{$reset_color%} $(git_prompt_info)$ '

ZSH_THEME_GIT_PROMPT_PREFIX="%{$fg_bold[blue]%}git:(%{$fg[red]%}"
ZSH_THEME_GIT_PROMPT_SUFFIX="%{$reset_color%} "
ZSH_THEME_GIT_PROMPT_DIRTY="%{$fg[blue]%}) %{$fg[yellow]%}x%{$reset_color%}"
ZSH_THEME_GIT_PROMPT_CLEAN="%{$fg[blue]%})"
```

```shell
# ~/.zshrc
ZSH_THEME="robbyrussell-ascii"
plugins=(git zsh-completions zsh-autosuggestions zsh-syntax-highlighting)
```

### 6.3 安装多个发行版

Windows 10 Fall Creators Update 之后，WSL 支持同时安装多个 Linux 发行版，直接在 Microsoft Store 中搜索想要的发行版并点击安装即可。这些发行版可以同时运行，并且数据互相独立。你可以使用 `wslconfig.exe` 来查询已安装的发行版，或者更改默认的发行版。

![multiple-wsl-distributions](https://img.prin.studio/images/2018/09/08/multiple-wsl-distributions.png)

删除发行版也很简单，直接卸载对应的商店应用即可（记得备份哦）。

### 6.4 多种进入 WSL 的方式比较

新版支持同时安装多个发行版，那自然不能像以前那样只提供一个 `bash.exe` 入口了。

秋季创意者更新之后的 Windows 提供了 [多种进入 WSL 环境的方式](https://blogs.msdn.microsoft.com/commandline/2017/11/28/a-guide-to-invoking-wsl/)：

- `wsl.exe`

  打开**默认**发行版中的默认 Shell。

- `<distroname>.exe`

  打开**指定**发行版中的默认 Shell。

- `bash.exe` (DEPRECATED)

  打开**默认**发行版中的 **bash** Shell。

  如果你更改了默认 Shell 却总是打开 bash，就说明你使用了这个入口。

你也可以通过这些入口直接在 WSL 中执行命令并返回结果：

- `<distroname> -c [command]`
- `bash -c [command]`
- `wsl [command]`（不再需要指定 `-c`）

![invoking-wsl-in-many-ways](https://img.prin.studio/images/2018/09/08/invoking-wsl-in-many-ways.png)

### 6.5 与 Windows 的互操作性

WSL 与 Windows 之间的互操作性 (Interoperability) 很牛逼。怎么个牛逼法呢？

Windows 下的所有盘符都挂载在 WSL 中的 `/mnt` 目录下，可以直接操作。WSL 中的所有数据则存放于 `C:\Users\{你的用户名}\AppData\Local\Packages\{Linux发行版包名}\LocalState\rootfs` 目录中（不要在 Windows 中修改这些文件，这会造成文件权限错误）：

```
$ ls /mnt
c  d  e
$ mount -l
rootfs on / type lxfs (rw,noatime)
C: on /mnt/c type drvfs (rw,noatime,uid=1000,gid=1000)
D: on /mnt/d type drvfs (rw,noatime,uid=1000,gid=1000)
E: on /mnt/e type drvfs (rw,noatime,uid=1000,gid=1000)
```

你可以在 Windows 命令行环境中直接调用 WSL 中的命令：

```cmd
PS C:\temp> wsl ls -al
total 0
drwxrwxrwx 1 prin  prin  4096 Sep  7 19:04 .
drwxrwxrwx 1 prin  prin  4096 Sep  7 18:38 ..
-rwxrwxrwx 1 prin  prin     4 Sep  7 19:04 foo.txt
```

你也可以在 WSL 中调用 Windows 中的命令行程序：

```shell
$ which ipconfig.exe
/mnt/c/Windows/System32/ipconfig.exe
$ ipconfig.exe
Windows IP Configuration
...
```

你可以在 WSL 中直接启动 Windows 应用：

```
$ notepad.exe "C:\temp\foo.txt"
```

你还可以通过 pipes 与 Windows 程序通信：

```
# 复制内容至 Windows 剪贴板
$ cat foo.txt | clip.exe
```

你甚至可以把 Windows 命令和 WSL 命令混着用：

```
PS> ipconfig | wsl grep IPv4
IPv4 Address. . . . . . . . . . . : 192.168.1.114

$ ipconfig.exe | grep IPv4 | cut -d: -f2
192.168.1.114

$ ls -al | findstr.exe foo.txt
-rwxrwxrwx 1 prin  prin 4 Sep  7 19:04 foo.txt

$ cmd.exe /c dir
 Volume in drive C is Windows
 Volume Serial Number is B263-****

 Directory of C:\temp

2018/09/07  19:04    <DIR>          .
2018/09/07  19:04    <DIR>          ..
2018/09/07  19:04                 4 foo.txt
               1 File(s)              4 bytes
               2 Dir(s)  194,422,341,632 bytes free
```

同时，WSL 与 Windows 共享网络栈，也就是说你可以：

- 在 WSL 中启动 web server，在 Windows 上使用浏览器访问；
- 在 Windows 下启动 MySQL/Redis 服务器，在 WSL 中连接；
- 诸如此类。

如果你对 WSL 与 Windows 之间互操作的原理有兴趣，可以参考一下这些文章：

- [WSL interoperability with Windows](https://docs.microsoft.com/en-us/windows/wsl/interop)
- [Windows and Ubuntu Interoperability](https://blogs.msdn.microsoft.com/wsl/2016/10/19/windows-and-ubuntu-interoperability/)

### 6.6 DrvFs 文件权限问题

虽然 WSL 中可以直接访问 Windows 磁盘的内容，但如果你曾经这么做过，你应该对这样绿油油一片的 `ls` 不会感到陌生。为什么 NTFS 文件系统中的文件到 WSL 下权限就全部成 `0777` 了呢？

![ls-with-wrong-file-permission](https://img.prin.studio/images/2018/09/08/ls-with-wrong-file-permission.png)

这主要是 DrvFs 中 Linux 文件权限的实现导致的。

在 WSL 中，[Microsoft 实现了两种文件系统](https://blogs.msdn.microsoft.com/wsl/2016/06/15/wsl-file-system-support/)，用于支持不同的使用场景：

- **VolFs**

  着力于在 Windows 文件系统上提供完整的 Linux 文件系统特性，通过各种手段实现了对 Inodes、Directory entries、File objects、File descriptors、Special file types 的支持。比如为了支持 Windows 上没有的 Inodes，VolFs 会把文件权限等信息保存在文件的 NTFS Extended Attributes 中。记得我上面警告过你不要在 Windows 中修改 WSL 里的文件吗？就是因为 Windows 中新建的文件缺少这个扩展参数，VolFs 无法正确获取该文件的 metadata，而且有些 Windows 上的编辑器会在保存时抹掉这些附加参数。

  WSL 中的 `/` 使用的就是 VolFs 文件系统。

- **DrvFs**

  着力于提供与 Windows 文件系统的互操作性。与 VolFs 不同，为了提供最大的互操作性，DrvFs 不会在文件的 NTFS Extended Attributes 中储存附加信息，而是从 Windows 的文件权限（Access Control Lists，就是你右键文件 > 属性 > 安全选项卡中的那些权限配置）推断出该文件对应的的 Linux 文件权限。

  所有 Windows 盘符挂载至 WSL 下的 `/mnt` 时都是使用的 DrvFs 文件系统。

由于 DrvFs 的文件权限继承机制很微妙，最后导致的结果就是所有文件的权限都变成了 `0777`。而且由于早期的 DrvFs 不支持 metadata，所以你无法给这些文件 chown/chmod，只能对着绿油油的 `ls` 干瞪眼。不过好消息是，Windows Insider Build 17063 之后，[DrvFs 也像 VolFs 一样支持给文件写入 metadata 了](https://blogs.msdn.microsoft.com/commandline/2018/01/12/chmod-chown-wsl-improvements/)。

要启用 DrvFs 的 metadata 支持，你需要添加参数重新挂载磁盘：

```
# 修改成你自己的盘符
$ sudo umount /mnt/e
$ sudo mount -t drvfs E: /mnt/e -o metadata
```

不过如果仅仅是执行了这个，虽然支持了文件权限的修改，但磁盘下的文件权限默认依然还是 `0777`，除非你给它们整个 `chmod` 一遍。如果你不想这么做，也可以指定其他的 mount 参数：

```
$ sudo mount -t drvfs E: /mnt/e -o metadata,uid=1000,gid=1000,umask=22,fmask=111
```

这样磁盘下的文件的默认权限就是 `0644`，`ls` 也不会再是绿油油一片啦。

![ls-with-fixed-file-permission](https://img.prin.studio/images/2018/09/08/ls-with-fixed-file-permission.png)

不过每次使用时都要重新挂载未免也太烦，我们可以通过另一个新特性 [Automatically Configuring WSL](https://blogs.msdn.microsoft.com/commandline/2018/02/07/automatically-configuring-wsl/) 实现自动挂载。在 WSL 中创建 `/etc/wsl.conf`，在其中填写如下内容：

```ini
[automount]
enabled = true
root = /mnt/
options = "metadata,umask=22,fmask=111"
mountFsTab = true

# 这个文件里还可以添加其他配置项，有兴趣的可以看看上面的链接
```

重启终端，所有的盘符就会使用上面的配置自动挂载啦（可以使用 `mount -l` 查看）。

另外，如果你想要给不同的盘符设定不同的挂载参数（上面的方法对所有盘符都有效，如果你想在 WSL 中运行 Windows 下的应用程序，就得每次都 `chmod +x` 一下，所以我一般都会把 `C:` 排除掉），就需要手动修改 `/etc/fstab`。首先确保 `wsl.conf` 中的 `mountFsTab` 为 `true`，然后编辑 `/etc/fstab`，添加如下内容：

```
# 不在此列表中的盘符会使用 wsl.conf 中的参数挂载
# 格式可以自己去查 fstab 的帮助文档
E: /mnt/e drvfs rw,relatime,uid=1000,gid=1000,metadata,umask=22,fmask=111 0 0
```

### 6.7 其他关于 WSL 的折腾

虽然 Microsoft 开发 WSL 出来主要是着重于命令行环境的使用，但经过测试，WSL 是可以通过 X Server 执行 GUI 应用程序的，[甚至还可以在 WSL 里面用 Wine 执行 Windows 程序](https://news.ycombinator.com/item?id=13603451)……（🤔？）

也有人试过在 WSL 中运行完整的 DE，体验似乎还不错，有兴趣的同学可以去试试。

另外，你也可以通过某些神秘的方法用上 Microsoft Store 未提供的 Linux 发行版，比如 [Arch Linux](https://wiki.archlinux.org/index.php/Install_on_WSL_%28%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87%29)。

如果你对 WSL 的底层实现有兴趣，也可以去围观一下 WSL 的官方博客：

- https://blogs.msdn.microsoft.com/wsl/
- https://blogs.msdn.microsoft.com/commandline/tag/wsl/

## 7. 总结

虽然 WSL 很不错，但是其比起真正的 Linux 系统还是有很多不足（Docker 等涉及未实现的内核特性的软件无法使用，Raw socket 相关的操作依然容易出错，I/O 性能相比之下较为孱弱等）。如果你日常开发中需要使用到那些 WSL 未提供的 Linux 特性，那么还是乖乖跑 VM 或者装 Linux 吧。

**对我来说，WSL 最大的意义就是，让我能够用我熟悉的 Linux 那一套去操作 Windows**。

如果你和我的需求一样，那么比起 Cygwin、VM 等解决方案，WSL 有着完整的 Linux 环境、强大的互操作性、更低的资源占用。离不开 Windows，却又羡慕 Linux 下强大命令行工具的各位，相信你们会喜欢 WSL 的。

而且最近几年 Microsoft 在笼络开发者方面的努力大家有目共睹，这里就容我夸上一句：

**Microsoft，干得漂亮！**
