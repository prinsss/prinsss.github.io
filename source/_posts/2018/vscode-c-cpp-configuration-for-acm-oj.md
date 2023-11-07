---
title: '使用 VS Code 搭建适用于 ACM 练习的 C/C++ 开发环境'
date: '2018-10-02 18:17:00'
updated: '2018-10-02 18:17:00'
categories: 技术
tags:
  - VSCode
  - C++
---

大学入学也快一个月了，总的来说，我过得很开心，不枉我花费一年的时间 [高考复读](https://prinsss.github.io/check-in-2018-07/)。具体哪里令人开心呢？我觉得最主要的是，比起初高中，大学的时间分配更为自由。

**中学时代，学生的时间基本都被学校安排得死死的**：早上什么时间必须到校，然后开始早读、上午五节课下午三节课、晚读、晚自习，最后在规定的时间离校（住宿生还要在规定的时间就寝），可以自由分配的时间少得可怜，在某些管理严格的学校甚至连人身自由都要被限制。虽然学生们苦中作乐的摸鱼技巧也不容小觑，但考虑到升学的压力，如果在兴趣上分配的时间过多，很有可能就会像我去年一样落得个无法升学的尴尬境地。

**而大学相对来说就没有那么多破规矩**：有课就上，没课的话时间就随你安排，回寝室睡觉也好出门嗨皮也罢，突出一个爱干嘛干嘛。在这些闲暇时间里，有人选择加入社团以及各种各样的学生组织，有人寻欢作乐讴歌青春，有人一头扎进自己的兴趣爱好中，也有人选择当个快乐摸鱼侠无事一身轻。

而我就比较硬核了，我选择参加可能让我基本告别头发的 ACM 程序设计竞赛（不）。

<!--more-->

![cs-no-hair](https://img.prin.studio/images/2018/10/02/cs-no-hair.jpg)

好啦言归正传，今天我们的主题是在 VS Code 编辑器中搭建适用于 ACM 练习的 C/C++ 开发环境。

## 0x01 需求分析

在我们学校，大一新生想要参加 ACM 集训队，必须先在学校的 OJ (Online Judge) 平台上刷完 200 道入门程序题。可选的语言有 C、C++ 和 Java，经过 [一番权衡](https://twitter.com/i/status/1040451170962071552) 后，我选择使用 C 语言来完成这些题目。

由于我之前基本上没有用过 C，所以上手第一步自然是搭建开发环境。

关于开发环境，C 程序设计的课以及学校 ACM 的讨论群里推荐的一般都是 [C-Free](http://www.programarts.com/cfree_ch/)、[Code::Blocks](http://www.codeblocks.org/home)、[Dev-C++](https://sourceforge.net/projects/orwelldevcpp/) 这类适用于初学者入门的老牌 IDE，但是我不喜欢这些软件，**因为它们太丑了**（直球）。而如果直接用那些现代化的大型 IDE（Visual Studio、CLion 等）的话，大材小用且不说，光启动就要半天我可受不了。所以我选择继续用我最爱的代码编辑器 —— [Visual Studio Code](https://code.visualstudio.com/) 来搭建 C 语言（也适用于 C++）的开发环境。

另外，鉴于 ACM 这类算法竞赛的特殊性，我们并不需要特别关注开发环境的工程相关特性（比如说依赖管理、代码导航、单元测试、代码重构等），所以我在这篇文章中介绍的开发环境配置基本不会涉及这些功能。如果想要用 C/C++ 开发大型项目，那么还是出门左转乖乖用 IDE 吧。

我对这个开发环境有如下需求：

- **好看**（语法高亮、界面配色等）；
- 运行速度快；
- 智能提示、自动补全、语法检查；
- 一键编译运行；
- 断点调试、变量追踪等。

得益于 VS Code 强大的扩展功能，这些特性通过简单的配置即可实现。

## 0x02 安装 C/C++ 编译器

有点常识的选手都知道，程序源码想要运行，必须要经过编译、连接等各种步骤。你在 IDE 上按个按钮就能直接跑，**只是因为 IDE 默默地帮你把这些活儿都干了**（所以一直以来都有人呼吁让编程初学者不要使用 IDE，原因是这会让新手难以了解底层的细节，其实也不是没有道理）。现在，我们得自己来干这些活儿了。

以下列出主流的 C/C++ 编译器及其适用平台以供参考：

- [**GCC**](https://gcc.gnu.org/) (GNU Compiler Collection)

  相信大家或多或少都听说过 GCC 以及 GNU 工具链的鼎鼎大名。

  *适用平台：GNU/Linux, Windows (MinGW), Unix, macOS.*

- [**Clang**](http://clang.llvm.org/)

  另一个流行的 C/C++/Objective C 编译器，使用 LLVM 后端。

  *适用平台：GNU/Linux, Windows, Unix, macOS.*

- [**MSVC**](https://blogs.msdn.microsoft.com/vcblog/2017/03/07/msvc-the-best-choice-for-windows/) (Microsoft Visual C++ compiler and libraries toolset)

  微软官方出品的 C/C++ 编译器，Visual Studio 中默认使用的就是这个。后来出了 standalone 版本，现在可以和其他一票 MSVC 工具集一起在 [Visual Studio Build Tools](https://aka.ms/buildtools) 中下载到。

  *适用平台：Windows.*

使用什么编译器看个人喜好与实际需求，如果不知道怎么选那就用 GCC，准没错。本文后续的配置也均基于 Windows 上的 GCC 进行，如果你打算使用其他编译器，配置也都是一个道理，自己改改就好了。

想在 Windows 上使用 GCC，必须安装 [MinGW](http://www.mingw.org/)、[Cygwin](https://www.cygwin.com/) 或者 [TDM-GCC](http://tdm-gcc.tdragon.net/) 这类 GCC 移植版与配套环境。下文将以 [MinGW-w64](http://mingw-w64.org/) （简单来说就是 MinGW 的增强版，如果你想知道它俩之间的那些破事儿也可以自己去搜一搜）为例进行配置。

> 当然，你也可以安装 [WSL (Windows Subsystem for Linux)](https://prinsss.github.io/wsl-guide/)，在 WSL 中安装 GCC，然后在 Windows 下 [调用 WSL 中的 GCC 编译源码为 Linux 可执行程序](https://github.com/Microsoft/vscode-cpptools/blob/master/Documentation/LanguageServer/Windows%20Subsystem%20for%20Linux.md) 并直接在 WSL 中运行。
>
> ~~如果你愿意，你甚至可以在 WSL 中安装 mingw-w64 交叉编译工具集，然后在 Windows 上调用 WSL 中的 `x86_64-w64-mingw32-gcc` 交叉编译器在 WSL 中把源码交叉编译为 Windows 可执行程序，最后在 WSL 中运行 Windows 可执行程序……但是没事谁这么蛋疼呢？~~

MinGW-w64 的安装过程我就不赘述了，在 [这里](https://sourceforge.net/projects/mingw-w64/files/) 下载安装包，一路点安装就完事儿了（便携版用户请注意将安装目录下的 `bin` 目录添加至 `PATH` 环境变量）。如果你需要，这里也有一个傻瓜教程：[《⑨也懂系列：MinGW-w64 安装教程》著名 C/C++ 编译器 GCC 的 Windows 版本](http://rsreland.net/archives/1760)。

安装过程中会要求你设置一些选项（这些同样适用于便携版的选择）：

- **Version**：GCC 版本，没特殊要求就选最高；
- **Architecture**：系统架构，64 位选 `x86_64`，32 位选 `i686`；
- **Threads**：操作系统 API，拿不准的话就选 `win32`；
- **Exception**：异常处理模型，`seh` 只支持 64 位系统，`sjlj` 兼容 32 位；
- **Build revision**：修订版本，保持默认即可。

![installing-mingw-w64](https://img.prin.studio/images/2018/10/02/installing-mingw-w64.png)

安装完后，在 `cmd.exe` 或者 PowerShell 中运行 `gcc --version` 命令，如果看到类似下面这样的输出，那么 MinGW-w64 就算安装完成了。

```text
gcc.exe (x86_64-posix-seh-rev0, Built by MinGW-W64 project) 5.4.0
Copyright (C) 2015 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
```

## 0x03 配置 VS Code 扩展

想要实现我们在第一节提出的需求，必不可少的就是 Microsoft 官方推出的 VS Code [C/C++ 扩展](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools)。这个扩展提供了针对 C/C++ 的 IntelliSense 与调试等功能，搜索「C/C++」即可直接安装。

![ms-vscode-cpptools](https://img.prin.studio/images/2018/10/02/ms-vscode-cpptools.png)

安装完后，<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> 打开命令面板运行 **C/Cpp: Edit configurations**，这会自动在当前打开的目录下创建 `.vscode/c_cpp_properties.json` 配置文件。由于下面的配置文件都是存储在当前文件夹下的 `.vscode` 目录中而非全局的，所以我推荐专门开一个工作区用于 C/C++ 开发（废话）。

生成的 `c_cpp_properties.json` 文件自带模板，你只需要修改其中的 `compilerPath` 为你的编译器可执行文件所在目录即可。如果你在上一步正确的安装步骤正确，VS Code 甚至可以自动检测你的编译器位置，无需任何修改。在我的机器上，这个文件的内容如下：

```json
{
    "configurations": [
        {
            "name": "MinGW",
            "intelliSenseMode": "gcc-x64",
            "compilerPath": "C:\\Portable\\mingw64\\bin\\gcc.exe",
            "includePath": [
                "${workspaceFolder}/**"
            ],
            "defines": [],
            "cStandard": "c11",
            "cppStandard": "c++17"
        }
    ],
    "version": 4
}
```

另外需要注意的是，网上不少教程都在 `includePath` 中添加了一大堆乱七八糟的目录，但是现在的 VS Code C/C++ 扩展已经可以通过 `compilerPath` 自动推断头文件以及库文件所在的目录，所以无需手动配置。

配置好此文件后，你就可以正常使用 IntelliSense 等功能了。

## 0x04 配置一键编译运行

虽然我们可以写完源码后切换至终端手动运行命令来编译运行：

```
$ gcc A.c -o A.exe
$ ./A.exe
```

但是这样未免也太麻烦，像我这种懒人，一键编译运行肯定是要搞一个的。

正如标题中提到的，本文所配置的开发环境主要目的是用于 ACM 练习。这些练习题基本上在单文件内即可完成，很少会需要用到多个源文件，更别提 Makefile 之类的工程化构建了。所以针对这些单文件的编译运行，我们有两种方法。其中一种比较简单，另一种稍微复杂一些。

**第一种，使用 Code Runner 扩展。**

这个扩展非常强大，可以让你在 VS Code 中直接运行各种语言的代码。虽然它并不支持复杂的构建流程，但是对于我们这种「编译运行单文件」的需求，Code Runner 正好胜任，而且更为简单快捷。

![vsc-code-runner](https://img.prin.studio/images/2018/10/02/vsc-code-runner.png)

扩展安装完成后，进入设置页面搜索 `code-runner`，可以看到这个扩展提供了很多配置项。这里我推荐各位将自定义的配置项 **保存至工作区**（别告诉我你用了这么久 VS Code 还不知道工作区是啥）而非全局，因为这个扩展也可以用于其他语言，最好不要让我们之后做出的一些专门针对 C/C++ 的配置污染到全局作用域中。

配置项有很多，各位可以根据自己的实际需求进行修改。以下是一些推荐修改的配置项：

```javascript
{
    // 在终端中运行编译命令，否则我们无法与程序通过标准输入交互
    "code-runner.runInTerminal": true,
    // 如果你全局设置中的默认终端是 WSL 之类的，那么可以在工作区设置中改回 PowerShell
    "terminal.integrated.shell.windows": "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
    // 运行代码之前清除之前的输出
    "code-runner.clearPreviousOutput": true,
    // 开启这个后在运行编译命令之前会自动 cd 至文件所在目录
    "code-runner.fileDirectoryAsCwd": true,
    // 因为上面那个选项会自动 cd，所以我删除了默认编译命令中的 cd 语句
    // 同时我将编译结果的输出目录修改为了同目录下的 build 文件夹
    // 不然源码文件和编译结果混杂在一个目录中非常杂乱（尤其是刷题时）
    // 这里只保留了 C 和 C++ 的编译命令，有需要其他语言的请自行添加
    "code-runner.executorMap": {
        "c": "gcc $fileName -o build/$fileNameWithoutExt && .\\build\\$fileNameWithoutExt",
        "cpp": "g++ $fileName -o build/$fileNameWithoutExt && .\\build\\$fileNameWithoutExt",
    },
    // 运行代码后切换焦点至终端，方便直接输入测试数据
    "code-runner.preserveFocus": false,
    // 在运行代码之前保存文件
    "code-runner.saveFileBeforeRun": true,
}
```

配置完成后，你可以通过 <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>N</kbd> 快捷键（可以自定义，我改成了 <kbd>F5</kbd>）或者右键菜单等方式编译运行当前编辑器中打开的文件，非常方便。效果如下：

<!-- 修改图片！ -->

![code-runner-demo](https://img.prin.studio/images/2018/10/02/code-runner-demo.png)

**除了使用 Code Runner，另一种在 VS Code 内执行编译的方法就是定义 Task。**

因为 Code Runner 只适用于单文件的编译运行（这对于 ACM 刷题的练习基本上已经足够），但如果你的程序涉及更复杂的编译流程，或者你需要使用 Debugger，那么就必须定义一个 Task 来完成构建：

- <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> 打开命令面板，运行 **Tasks: Configure Task**；
- 选择「使用模板创建 tasks.json 文件」；
- 选择「Others 运行任意外部命令的示例」。

这会在 `.vscode` 目录中生成一个 `tasks.json` 文件（上面生成的那个 `c_cpp_properties.json` 配置文件也在这个目录里），将其内容修改为（注意，我这里给出的示例依然是适用于单文件的）：

```javascript
{
    // See https://go.microsoft.com/fwlink/?LinkId=733558
    // for the documentation about the tasks.json format
    "version": "2.0.0",
    "tasks": [
        {
            "label": "compile",
            "type": "shell",
            "command": "gcc",
            "args": [
                "-g",
                "\"${file}\"",
                "-o",
                "\"${fileDirname}\\build\\${fileBasenameNoExtension}\""
            ],
            "presentation": {
                "reveal": "always",
                "panel": "shared",
                "focus": false,
                "echo": true
            },
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "problemMatcher": {
                "owner": "cpp",
                "fileLocation": "absolute",
                "pattern": {
                    "regexp": "^(.*):(\\d+):(\\d+):\\s+(error):\\s+(.*)$",
                    "file": 1,
                    "line": 2,
                    "column": 3,
                    "severity": 4,
                    "message": 5
                }
            }
        }
    ]
}
```

我们主要需要关注的就是 `command` 和 `args` 这两个配置项，相信大家都能看懂，我就不多解释了。如果你用的是 C++，将 `command` 中的 `gcc` 修改为 `g++` 即可。如果你想知道其他那些配置项是啥意思，也可以参考 VS Code 的官方文档：[Integrate with External Tools via Tasks](https://code.visualstudio.com/docs/editor/tasks)。

配置完成后，我们就可以通过命令面板运行 **Tasks: Run Build Task** 或者 <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd> 快捷键运行刚才定义的 Task 执行构建（不过这只会执行编译命令，并不会运行编译后的程序）。

## 0x05 配置调试器

配置好了一键编译运行，我们还得配置一下调试器 (Debugger)。虽然我以前写 PHP 和 JavaScript 时都是不用调试器、`var_dump` `console.log` 一把梭的选手，但是这在写 C 时可行不通，所以还是乖乖用调试器吧。

C/C++ 的调试器也有很多，下面以我们之前安装的 MinGW-w64 中配套的 GDB 为例进行配置：

- 在 VS Code 侧边栏切换至「调试」面板；
- 点击面板上部的齿轮图标（配置或修复 `launch.json`）；
- 在弹出的「选择环境」面板中选择 `C++ (GDB/LLDB)`。

![configue-launch-json](https://img.prin.studio/images/2018/10/02/configue-launch-json.png)

这会在当前工作区的 `.vscode` 目录中新建一个 `launch.json` 文件，修改文件内容如下：

```javascript
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "name": "(gdb) Launch",
            "type": "cppdbg",
            "request": "launch",
            "program": "${fileDirname}/build/${fileBasenameNoExtension}.exe",
            "args": [],
            "stopAtEntry": false,
            "cwd": "${workspaceFolder}",
            "environment": [],
            "externalConsole": true,
            "MIMode": "gdb",
            // 这里填你 MinGW-w64 安装目录下的 gdb 路径
            "miDebuggerPath": "C:\\Portable\\mingw64\\bin\\gdb.exe",
            "setupCommands": [
                {
                    "description": "Enable pretty-printing for gdb",
                    "text": "-enable-pretty-printing",
                    "ignoreFailures": true
                }
            ],
            // 这里要与你在 tasks.json 中配置的 label 一致
            "preLaunchTask": "compile",
        }
    ]
}
```

其中各配置项的作用可以参阅官方文档：[Configuring launch.json for C/C++ debugging](https://github.com/Microsoft/vscode-cpptools/blob/master/launch.md).

配置正确后的调试效果图如下：

![vsc-debugger-demo](https://img.prin.studio/images/2018/10/02/vsc-debugger-demo.png)

## 0x06 后记

至此，我们已经完成了对 VS Code C/C++ 开发环境的配置。

虽然真正用 C/C++ 开发项目时还是用正儿八经的 IDE 比较好，但是如果只是用于 ACM 这类算法相关竞赛的刷题练习的话，用 VS Code 这类轻量级的代码编辑器还是非常舒适的。

如果想了解更多使用 VS Code 开发 C/C++ 的信息，这里有一些参考链接：

- [C/C++ for Visual Studio Code (Preview)](https://code.visualstudio.com/docs/languages/cpp)
- [Microsoft/vscode-cpptools](https://github.com/Microsoft/vscode-cpptools)
- [使用 Visual Studio Code 搭建 C/C++ 开发和调试环境](https://segmentfault.com/a/1190000014800106)
- [使用 VSCode 搭建 C/C++ 开发环境](https://www.jianshu.com/p/8933ebdac814)
