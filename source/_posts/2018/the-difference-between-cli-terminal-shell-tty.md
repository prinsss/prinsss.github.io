---
title: '命令行界面 (CLI)、终端 (Terminal)、Shell、TTY，傻傻分不清楚？'
date: '2018-08-22 22:30:13'
updated: '2018-08-22 22:30:13'
categories: 技术
tags:
  - 命令行
  - 分享
---

诸君，好久不见。

为什么突然想写这样一篇文章呢？其实是因为在最近计划发布的一篇关于 WSL (Windows Subsystem for Linux) 的博文中，我打算对终端模拟器、Shell 的选择与配置进行一些说明。不过对于刚接触 Linux 或者刚接触命令行界面的同学，可能会有些难以理解它们之间的区别（事实上我当初也是这样）。

虽然这个话题已是老生常谈，搜索一下应该也能找到大把的相关文章。不过难得提到了这方面，就趁此机会把我的理解写下来，一来看看我是不是真正理解了，二来看看我能不能把它们之间的区别讲得更加简明易懂。

<!--more-->

## 0. 太长不看 TL;DR

- **命令行界面** (CLI) = 使用文本命令进行交互的用户界面
- **终端** (Terminal) = **TTY** = 文本输入/输出环境
- **控制台** (Console) = 一种特殊的终端
- **Shell** = 命令行解释器，执行用户输入的命令并返回结果

## 1. 什么是命令行界面？

命令行界面，通俗来讲，就是你看过的那种满屏幕都是字符的界面。

> 命令行界面（英语：Command-line Interface，缩写：CLI）是在图形用户界面得到普及之前使用最为广泛的用户界面，它通常不支持鼠标，用户通过键盘输入指令，计算机接收到指令后，予以执行。
>
> —— 摘自 [Wikipedia](https://zh.wikipedia.org/wiki/%E5%91%BD%E4%BB%A4%E8%A1%8C%E7%95%8C%E9%9D%A2)

相信大家对于影视作品中出现的那种，某黑客/程序员/安全专家坐在电脑前猛敲键盘、屏幕上放眼望去全是滚动的字符的场景不会感到陌生。这种靠一行行命令的输入输出进行交互的用户界面，就叫做命令行界面。

![the_matrix_screenshot](https://img.prin.studio/images/2018/08/24/the_matrix_screenshot.jpg)

*▲ 电影「黑客帝国」剧照*

在图形用户界面 (GUI) 已经完全普及的今天，普通用户在日常使用电脑的过程中几乎不用手动输入任何命令，大部分操作都是点点鼠标就能完成，而熟练使用命令行操作似乎已经成为高逼格的代名词。

但事实上，现在依然有着很多的软件开发者、系统管理员，或者是高级用户在使用命令行界面操作计算机。其中很大一个原因，就是效率：在熟记命令的前提下，使用命令行界面往往要比使用图形用户界面来得快。

举个栗子，我要把当前目录下的（包括嵌套的子目录）所有 `*.tpl` 文件的后缀名修改为 `*.blade.php`，如果不使用命令行，该怎么做？手动修改肯定不至于，但也得去网上找找相关软件，得要注意下载来源是否靠谱（像我这样有点洁癖的选手还得去找绿色版），下载后还要手动指定文件路径、重命名模板……

而使用命令行的话（这里以 Ubuntu 上的 Bash 为例），只需运行这么一句：

```shell
rename 's/\.tpl$/\.blade.php/' ./**/*.tpl
```

命令行操作的高效率等优点，也是现在许多图形化的计算机系统依然没有放弃提供命令行操作方式的原因。就连 Windows 都有自带 `cmd.exe` 和 PowerShell 等命令行程序（事实上你在搜索「批量重命名」时，可以看到很多方案都是通过「Windows 命令提示符」实现的）。

## 2. 终端 —— 人与机器交互的接口

终端 (Terminal)，其词汇本身的意义为「终点站；末端；（电路）的端子，线接头」。而在计算机领域，终端则是一种用来让用户输入数据至计算机，以及显示其计算结果的机器。

也就是说，终端只是一种用于与计算机进行交互的输入输出设备，其本身并不提供运算处理功能。

想要充分理解终端，我们得回溯历史，去看看终端的起源。

### 2.1 历史上的终端

在大型机 (Mainframe) 和小型机 (Minicomputer) 的时代里，计算机曾经非常昂贵且巨大，不像现在这样人手一台。这些笨重的计算机通常被安置在单独的房间内，而操作计算机的人们坐在另外的房间里，通过某些设备与计算机进行交互。这种设备就叫做 **终端** (Terminal)，也叫终端机。

![ASR-33](https://img.prin.studio/images/2018/08/22/ASR-33_2.jpg)

*▲ ASR-33 电传打字机（图片来源：[Flickr - Marcin Wichary](https://www.flickr.com/photos/8399025@N07/2283401196/)，CC-BY-2.0）*

早期的终端一般是一种叫做 **电传打字机** (Teletype) 的设备。为啥呢？因为 Unix 的创始人 Ken Thompson 和 Dennis Ritchie 想让 Unix 成为一个多用户系统。多用户系统就意味着要给每个用户配置一个终端，每个用户都要有一个显示器、一个键盘。但当时所有的计算机设备都非常昂贵（包括显示器），而且键盘和主机是集成在一起的，根本没有独立的键盘。

后来他们机智地找到了一样东西，那就是 [ASR-33 电传打字机](https://en.wikipedia.org/wiki/Teletype_Model_33)。虽然电传打字机原本的用途是在电报线路上收发电报，但是它既有可以发送信号的键盘，又能把接收到的信号打印在纸带上，完全可以作为人机交互设备使用。

而且最重要的是，价格低廉。:P

于是，他们把很多台 ASR-33 连接到计算机上，让每个用户都可以在终端登录并操作主机。就这样，他们创造了计算机历史上第一个真正的多用户操作系统 Unix，而电传打字机就成为了第一个 Unix 终端。

> 想知道用电传打字机做终端是一种怎样的体验？这里有一个 [很炫酷的演示视频](https://www.youtube.com/watch?v=MikoF6KZjm0)。

### 2.2. 控制台 (Console) 是什么？

上面我们说过，在历史上，终端是连接到计算机上的一种带输入输出功能的外设。但是有一个终端与众不同，它与计算机主机是一体的，是计算机的一个组成部分。这个特殊的终端就叫做 **控制台** (Console)。

顾名思义，控制台是用于管理主机的，只能给系统管理员使用，有着比普通终端更大的权限。一台计算机上一般只有一个控制台，但是可以连接很多个终端。

![console_and_terminal](https://img.prin.studio/images/2018/08/22/console_and_terminal.jpg)

*▲ 左边的是 Console，右边的是 Terminal（图片来源：[带你逛西雅图活电脑博物馆](https://zhuanlan.zhihu.com/p/21895357)）*

放在现在我们可能难以理解为什么会有控制台和终端的区分，不过就像上一节所说的，当时都是很多个用户通过终端去访问一台计算机，而专门管理那些大块头机器的系统管理员另有其人。普通用户用的就是普通的终端，而系统管理员用的终端比较牛逼，所以就被叫做控制台啦（笑）。

不过随着个人计算机的普及，控制台 (Console) 与终端 (Terminal) 的概念已经逐渐模糊。在现代，我们的键盘与显示器既可以认为是控制台，也可以认为是普通的终端。当你在管理系统时，它们是控制台；当你在做一般的工作时（浏览网页、编辑文档等），它们就是终端。我们自己既是一般用户，也是系统管理员。

因此，现在 Console 与 Terminal 基本被看作是同义词。

### 2.3 字符终端与图形终端

终端也有不同的种类。

**字符终端** (Character Terminal) 也叫文本终端 (Text Terminal)，是只能接收和显示文本信息的终端。早期的终端全部是字符终端。字符终端也分为 **哑终端** (Dumb Terminal) 和所谓的 **智能终端** (Intelligent Terminal)，因为后者可以理解转义序列、定位光标和显示位置，比较聪明，而哑终端不行。

![DEC_VT100_terminal](https://img.prin.studio/images/2018/08/22/DEC_VT100_terminal.jpg)

*▲ DEC VT100 终端（图片来源：[Flickr - Jason Scott](https://www.flickr.com/photos/54568729@N00/9636183501)，CC-BY-2.0）*

DEC 公司在 1978 年制造的 [VT100](https://en.wikipedia.org/wiki/VT100)，由于其设计良好并且是第一批支持 ANSI 转义序列与光标控制的智能终端，获得了空前的成功。VT100 不仅是史上最流行的字符终端，更是成为了字符终端事实上的标准。

随着技术的进步，图形终端 (Graphical Terminal) 也开始出现在公众的视野中。图形终端不但可以接收和显示文本信息，也可以显示图形与图像。著名的图形终端有 [Tektronix 4010](https://en.wikipedia.org/wiki/Tektronix_4010) 系列。

不过现在专门的图形终端已经极为少见，他们基本上已经被全功能显示器所取代。

### 2.3. 终端模拟器 (Terminal Emulator)

随着计算机的进化，我们已经见不到专门的终端硬件了，取而代之的则是键盘与显示器。

但是没有了终端，我们要怎么与那些传统的、不兼容图形接口的命令行程序（比如说 GNU 工具集里的大部分命令）交互呢？这些程序并不能直接读取我们的键盘输入，也没办法把计算结果显示在我们的显示器上……（图形界面的原理我这里就不多说了，它们编程的时候图形接口还在娘胎里呢！）

这时候我们就需要一个程序来模拟传统终端的行为，即 **终端模拟器** (Terminal Emulator)。

> 严格来讲，Terminal Emulator 的译名应该是「终端仿真器」。

对于那些命令行 (CLI) 程序，终端模拟器会「假装」成一个传统终端设备；而对于现代的图形接口，终端模拟器会「假装」成一个 GUI 程序。一个终端模拟器的标准工作流程是这样的：

1. 捕获你的键盘输入；
2. 将输入发送给命令行程序（程序会认为这是从一个真正的终端设备输入的）；
3. 拿到命令行程序的输出结果（STDOUT 以及 STDERR）；
4. 调用图形接口（比如 X11），将输出结果渲染至显示器。

终端模拟器有很多，这里就举几个经典的例子：

- GNU/Linux：gnome-terminal、Konsole；
- macOS：Terminal.app、iTerm2；
- Windows：[Win32 控制台](https://zh.wikipedia.org/wiki/Win32%E6%8E%A7%E5%88%B6%E5%8F%B0)、ConEmu 等。

![my-terminals](https://img.prin.studio/images/2018/08/22/my-terminals.png)

*▲ 我正在使用的终端模拟器：[Hyper](https://hyper.is/) 与 [wsl-terminal](https://github.com/goreliu/wsl-terminal)*

在专门的终端硬件已经基本上仅存于计算机博物馆的现代，人们通常图省事儿，直接称呼终端模拟器为「终端」。

### 2.4 终端窗口 (Terminal Window) 与虚拟控制台 (Virtual Console)

大部分终端模拟器都是在图形用户界面 (GUI) 中运行的，但是也有例外。

比如在 GNU/Linux 操作系统中，按下 <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>F1,F2...F6</kbd> 等组合键可以切换出好几个黑不溜秋的全屏终端界面，而按下 <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>F7</kbd> 才是切换回图形界面。不过不要被它们唬着了，虽然它们并不运行在图形界面中，但其实它们也是终端模拟器的一种。

![KNOPPIX_booting](https://img.prin.studio/images/2018/08/22/KNOPPIX_booting.png)

*▲ 一个正在显示系统启动信息的虚拟控制台（图片来源：[hacktolive.org](https://commons.wikimedia.org/wiki/File:KNOPPIX_booting.png)，GPLv2）*

这些全屏的终端界面与那些运行在 GUI 下的终端模拟器的唯一区别就是它们是 **由操作系统内核直接提供的**。这些由内核直接提供的终端界面被叫做 [虚拟控制台](https://en.wikipedia.org/wiki/Virtual_console) (Virtual Console)，而上面提到的那些运行在图形界面上的终端模拟器则被叫做 **终端窗口** (Terminal Window)。除此之外并没有什么差别。

当然了，因为终端窗口是跑在图形界面上的，所有如果图形界面宕掉了那它们也就跟着完蛋了。这时候你至少还可以切换到 Virtual Console 去救火，因为它们由内核直接提供，只要系统本身不出问题一般都可用（笑）。

## 3. 那么 TTY 又是什么？

简单来说，tty 就是终端的统称。

为什么呢？看了上面的 2.1 节的同学应该知道，最早的 Unix 终端是 ASR-33 电传打字机。而电传打字机 (Teletype / Teletypewriter) 的英文缩写就是 tty，即 tty 这个名称的来源。

由于 Unix 被设计为一个多用户操作系统，所以人们会在计算机上连接多个终端（在当时，这些终端全都是电传打字机）。Unix 系统为了支持这些电传打字机，就设计了名为 tty 的子系统（没错，因为当时的终端全都是 tty，所以这个系统也被命名为了 tty，就是这么简单粗暴），将具体的硬件设备抽象为操作系统内部位于 `/dev/tty*` 的设备文件。

> 为什么要把电传打字机这个硬件设备抽象成「tty 设备」文件呢？有兴趣的同学可以去了解一下 Unix 操作系统中 *Everything is a file* 的概念。

![tty_device_files](https://img.prin.studio/images/2018/08/22/tty_device_files.png)

*▲ 还记得上面我们说过的特殊的终端，也就是通过 <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>F1-6</kbd> 呼出的那些虚拟控制台 (Virtual Console) 吗？其对应的就是上图中的 `tty1` 到 `tty6`。*

随着计算机的发展，终端设备已经不再限制于电传打字机，但是 tty 这个名称还是就这么留了下来。久而久之，它们的概念就混淆在了一起。所以在现代，tty 设备就是终端设备，终端设备就是 tty 设备，无需区分。

> 由于早期计算机上的 [串行端口 (Serial Port)](https://en.wikipedia.org/wiki/Serial_port) 最大的用途就是连接终端设备，所以当时的 Unix 会把串口上的设备也同样抽象为 tty 设备（位于 `/dev/ttyS*`）。因此，现在人们也经常将串口设备称呼为 tty 设备。

在 tty 子系统中后来还衍生出了 pty、ptmx、pts 等概念，这里就不详细展开了。有兴趣的同学可以参考一下这篇文章：[Linux TTY/PTS 概述](https://segmentfault.com/a/1190000009082089)。

## 4. Shell —— 提供用户界面的程序

大家都知道，操作系统有一个叫做 **内核** (Kernel) 的东西，它管理着整台计算机的硬件，是现代操作系统中最基本的部分。但是，内核处于系统的底层，是不能让普通用户随意操作的，不然一个不小心系统就崩溃啦！

但我们总还是要让用户操作系统的，怎么办呢？这就需要一个专门的程序，它接受用户输入的命令，然后帮我们与内核沟通，最后让内核完成我们的任务。这个提供用户界面的程序被叫做 **Shell** (壳层)。

> 其实 Shell 只是提供了一个用户操作系统的入口，我们一般是通过 Shell 去调用其他各种各样的应用程序，最后来达成我们的目的。比如说我们想要知道一个文件的内容，我们会在 Shell 中输入命令 `cat foo.txt`，然后 Shell 会帮我们运行 `cat` 这个程序，`cat` 再去调用内核提供的 `open` 等系统调用来获取文件的内容。虽然并不是 Shell 直接去与内核交互，但广义上可以认为是 Shell 提供了与内核交互的用户界面。

至于为什么叫做 Shell，看下图就知道啦。是不是很像一层壳呢？

![computer_system](https://img.prin.studio/images/2018/08/23/computer_system.png)

Shell 通常可以分为两种：**命令行 Shell** 与 **图形 Shell**。顾名思义，前者提供一个命令行界面 (CLI)，后者提供一个图形用户界面 (GUI)。Windows 下的 `explorer.exe` 就是一个典型的图形 Shell（没错，它确实是，因为它接受来自你的指令，并且会帮你与内核交互完成你的指令）。

常见或历史上知名的命令行 Shell 有：

- 适用于 Unix 及类 Unix 系统：
  - **sh** (Bourne shell)，最经典的 Unix shell；
  - **bash** (Bourne-Again shell)，目前绝大多数 Linux 发行版的默认 shell；
  - **zsh** (Z shell)，我个人最喜欢的 shell；
  - **fish** (Friendly interactive shell)，专注于易用性与友好用户体验的 shell；
- Windows 下的 **cmd.exe** (命令提示符) 与 **PowerShell**。

还有其他各种五花八门的 Shell 程序，这里就不一一列举了，有兴趣的自己去搜一搜吧。:P

## 5. Shell 与终端的分工

现在我们知道，终端干的活儿是从用户这里接收输入（键盘、鼠标等输入设备），扔给 Shell，然后把 Shell 返回的结果展示给用户（比如通过显示器）。而 Shell 干的活儿是从终端那里拿到用户输入的命令，解析后交给操作系统内核去执行，并把执行结果返回给终端。

不过 Shell 与终端的分工有一些容易混淆的地方，这里以例子进行说明：

- 终端将用户的键盘输入转换为控制序列（除了字符以外的按键，比如 `左方向键` → `^[[D`），Shell 则解析并执行收到的控制序列（比如 `^[[D` → `将光标向左移动`）；
- 不过也有例外，比如终端在接收到 <kbd>Ctrl</kbd> + <kbd>C</kbd> 组合键时，不会把这个按键转发给当前的程序，而是会发送一个 `SIGINT` 信号（默认情况下，这会导致进程终止）。其他类似的特殊组合键有 <kbd>Ctrl-Z</kbd> 与 <kbd>Ctrl-\\</kbd> 等，可以通过 `stty -a` 命令查看当前终端的设置。

![shell_control_sequences](https://img.prin.studio/images/2018/08/22/shell_control_sequences.png)

- Shell 发出类似「把前景色改为红色（控制序列为 `\033[31m`）」「显示 `foo`」等指令；
- 终端接收这些指令，并且照着 Shell 说的做，于是你就看到了终端上输出了一行红色的 `foo`。

![terminal_control_sequences](https://img.prin.studio/images/2018/08/22/terminal_control_sequences.png)

- 除非被重定向，否则 Shell 永远不会知道它所执行命令的输出结果。我们可以在终端窗口中上下翻页查看过去的输出内容，这完全是终端提供的 feature，与 Shell 没有半毛钱关系；
- 命令提示符 (Prompt) 是一个完全的 Shell 概念，与终端无关；
- 行编辑、输入历史与自动补全等功能是由 Shell 提供的（比如 fish 这个 Shell 就有着很好用的历史命令与命令自动补全功能）。不过终端也能自己实现这些功能，比如说 XShell 这个终端模拟器就可以在本地写完一行命令，然后整条发送给远程服务器中的 Shell（在连接状况不佳时很有用，不然打个字都要卡半天）；
- 终端中的复制粘贴功能（<kbd>Shift</kbd> + <kbd>Insert</kbd> 或者鼠标右键等）基本上都是由终端提供的。举个例子，Windows 默认的终端对于复制粘贴的支持很屎，而换一个终端（例如 `ConEmu`）后就可以很好地支持复制粘贴。不过 Shell 以及其他命令行程序也可以提供自己的复制粘贴机制（例如 vim）。

## 6. 总结

计算机史这玩意，有趣是挺有趣的，就是查起资料来太费脑子。

为了不误人子弟，在这篇博文写作的过程中我也查阅了各种各样的文档和史料，力求内容的准确性。不过能力所限，如果文章中仍有出现谬误，欢迎在下方评论区批评指正。

## 7. 参考链接

- [命令行界面 - Wikipedia](https://zh.wikipedia.org/wiki/%E5%91%BD%E4%BB%A4%E8%A1%8C%E7%95%8C%E9%9D%A2)
- [What is the exact difference between a 'terminal', a 'shell', a 'tty' and a 'console'?](https://unix.stackexchange.com/questions/4126/what-is-the-exact-difference-between-a-terminal-a-shell-a-tty-and-a-con)
- [Why is a virtual terminal "virtual", and what/why/where is the "real" terminal?](https://askubuntu.com/questions/14284/why-is-a-virtual-terminal-virtual-and-what-why-where-is-the-real-terminal)
- [终端，Shell，“tty” 和控制台（console）有什么区别？ - 知乎](https://www.zhihu.com/question/21711307/answer/118788917)
- [你真的知道什么是终端吗？ - Linux 大神博客](https://www.linuxdashen.com/%E4%BD%A0%E7%9C%9F%E7%9A%84%E7%9F%A5%E9%81%93%E4%BB%80%E4%B9%88%E6%98%AF%E7%BB%88%E7%AB%AF%E5%90%97%EF%BC%9F)
- [终端 - Wikipedia](https://zh.wikipedia.org/wiki/%E7%B5%82%E7%AB%AF)
- [Terminal emulator - Wikipedia](https://en.wikipedia.org/wiki/Terminal_emulator)
- [console(4): console terminal/virtual consoles - Linux man page](https://linux.die.net/man/4/console)
- [Linux TTY/PTS 概述 - SegmentFault](https://segmentfault.com/a/1190000009082089)
- [Linux TTY framework(1)_基本概念](http://www.wowotech.net/tty_framework/tty_concept.html)
- [Shell (computing) - Wikipedia](https://en.wikipedia.org/wiki/Shell_%28computing%29)
- [学习 bash shell - 鸟哥的 Linux 私房菜](http://cn.linux.vbird.org/linux_basic/0320bash.php)
- [Ubuntu Manpage: 控制终端代码 - Linux 控制终端转义和控制序列](http://manpages.ubuntu.com/manpages/cosmic/zh_CN/man4/console_codes.4.html)
