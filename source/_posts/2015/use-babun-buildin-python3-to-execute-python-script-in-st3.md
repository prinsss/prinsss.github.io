---
title: '在 Sublime Text 3 中使用 babun 内 python3 作为 build system'
date: '2015-11-01 21:29:08'
updated: '2015-11-01 21:33:14'
categories: 技术
tags:
  - Sublime
---


标题是不是写的有点绕呢~

因为 ST3 内置的 python build system，是使用 cmd 的命令的，然而窝的 Python 配置啊，pip 安装的库啊都是在 babun 里安装的 python 中配置的。（babun [是个啥](http://babun.github.io/)？）因为 ST3 的 `Ctrl + B` 很好用，懒得切出去终端里执行了，所以需要自定义 ST3 的 `build system` 以使用 babun 内置 python3 来运行 python 脚本。

首先先找到你的 babun 的 bin 目录，一般都位于这个目录下：

C:\Users\your-uname\.babun\cygwin\bin\

其中的 `your-uname` 替换成你自己的 windows 用户名

然后 ST3 中执行：<span class="lang:default decode:true crayon-inline ">Tools -> Build System -> New Build System…</span>

会打开一个名为 `untitled.sublime-build` 的新文件，内容如下

{ "shell_cmd": "make" }

将其改为：

{ "cmd": ["C:\\Users\\your-uname\\.babun\\cygwin\\bin\\python3.4m.exe", "-u", "$file"], "file_regex": "^[ ]*File \"(...*?)\", line ([0-9]*)", "selector": "source.python" }

并重命名保存到 <span class="lang:default decode:true crayon-inline ">C:\Users\your-uname\AppData\Roaming\Sublime Text 3\Packages\User</span>  目录下。

注意使用 `\\\` 转义反斜杠。另外 babun 中 `/bin/python3.4m.exe` 这个请酌情而定。

babun 默认内置的是 python 2.7，可以使用 `$ pact install python3`，使用 `$ ls -al /usr/bin/ |grep python` 来查看所安装的 python 版本可执行文件。

最终效果如下：

[![final](https://img.prin.studio/images/2015/11/2015-11-01_05-24-05.png)](https://img.prin.studio/images/2015/11/2015-11-01_05-24-05.png)



