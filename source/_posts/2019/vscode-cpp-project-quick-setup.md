---
title: 'VS Code C/C++ 项目快速配置模板'
date: '2019-12-19 19:20:00'
updated: '2019-12-19 19:20:00'
categories: 技术
tags:
  - VS Code
  - C/C++
---

去年我写过一篇博客「[使用 VS Code 搭建适用于 ACM 练习的 C/C++ 开发环境](https://printempw.github.io/vscode-c-cpp-configuration-for-acm-oj/)」，主要介绍了在 VS Code 里跑简单 C 程序的一些方法。不过那篇文章里介绍的方法仅适用于单文件程序，所以稍微大一点的项目就力不从心了。

但是对于课程设计这类，说大不大说小也不算小的 C++ 项目，也不是特别想用大型 IDE……所以我更新了一下相关的 VSC 配置，使其也能用于多文件的 C++ 项目。

为了方便以后复用，也给其他有类似需求的人一个参考，相关的配置文件整理如下（[Gist](https://gist.github.com/printempw/bcfa32a33cc268945200cb23172f262d)，新建项目时复制一份到 `.vscode` 里就行了）。

<!--more-->

> 这一年来 VS Code 的 [C/C++  扩展](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) 更新了不少，还支持在 WSL 里 Remote 开发了。不过本文中还是继续以 Windows 下的 MinGW-w64 为例。WSL 的配置也差不多，有兴趣的可以看看参考链接里的官方文档。

`c_cpp_properties.json`：

```javascript
{
    "configurations": [
        {
            // 配置的名称，可以添加多个在编辑器右下角切换
            "name": "MinGW G++",
            "intelliSenseMode": "gcc-x64",
            // 这里的编译器路径，包括下面的一些选项都只是
            // 给 IntelliSense 用的，和具体项目构建没关系
            "compilerPath": "C:\\Portable\\mingw64\\bin\\g++.exe",
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

`tasks.json`：

```javascript
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "compile",
            "type": "shell",
            // 拼装编译命令（以 g++ 为例）
            "command": "g++",
            "args": [
                "-g",
                "-std=c++1z",
                "\"src/*.cpp\"",
                "-o",
                "\"build/${workspaceFolderBasename}\""
            ],
            "options": {
                // 在这个目录里执行编译命令
                "cwd": "${workspaceFolder}",
                "shell": {
                    // 在 PowerShell 里执行命令，否则无法识别 *.cpp
                    "executable": "powershell.exe"
                }
            },
            "presentation": {
                "reveal": "always",
                "panel": "shared",
                "focus": false,
                "echo": true
            },
            // 从编译器的输出里提取 WARNING、ERROR 等信息
            "problemMatcher": ["$gcc"],
            "group": {
                "kind": "build",
                "isDefault": true
            }
        }
    ]
}
```

`launch.json`：

```javascript
{
    "version": "0.2.0",
    "configurations": [
        {
            // 使用 GDB 调试程序
            "name": "(gdb) Launch",
            "type": "cppdbg",
            "request": "launch",
            // 之前编译好的可执行文件路径
            "program": "${workspaceFolder}/build/${workspaceFolderBasename}.exe",
            "args": [],
            "stopAtEntry": false,
            // 设置 cwd 到 build 目录
            "cwd": "${workspaceFolder}/build",
            "environment": [],
            // 不要在集成终端里运行程序
            "externalConsole": true,
            "MIMode": "gdb",
            // 调试器可执行文件的路径
            "miDebuggerPath": "C:\\Portable\\mingw64\\bin\\gdb.exe",
            "setupCommands": [
                {
                    "description": "Enable pretty-printing for gdb",
                    "text": "-enable-pretty-printing",
                    "ignoreFailures": true
                }
            ],
            // 调试前先运行 compile（定义在上面的 tasks.json 里）
            "preLaunchTask": "compile"
        }
    ]
}
```

稍微解释一下这些文件的作用。

这三个文件都是放在项目的 `.vscode` 目录下的，其中 `c_cpp_properties.json` 用于配置 VSC 的 C/C++ 扩展，`tasks.json` 配置项目的构建流程，`launch.json` 则是配置如何运行（或调试）构建好的程序。

在 VSC 内编辑这些配置文件时，鼠标移动到 JSON 的 key 上就可以查看相关配置项的说明，非常方便。另外 `c_cpp_properties.json` 这个文件，也可以通过 <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> 面板运行 `C/C++: Edit Configurations (UI)` 命令打开图形化配置页面。关键配置项的作用都已经在上面的注释里说明了，就不再赘述。

最终整个项目的目录结构应该是这样的：

```text
$ tree -a
.
├── .vscode
│   ├── c_cpp_properties.json
│   ├── launch.json
│   ├── settings.json
│   └── tasks.json
├── build
│   └── vscode-cpp-quick-setup.exe
└── src
    ├── Greeter.cpp
    ├── Greeter.h
    └── main.cpp
```

所有源代码放在 `src` 目录中，编译后的可执行文件将以当前 workspace 命名（一般是目录名），存放于 `build` 目录中。

另外必须吐槽的一点是，9012 年了，C/C++ 扩展还不支持「以非调试模式运行」，绝了。如果你想要不调试直接跑，可以自己新建一个 Task 来运行程序。不过这超出了本文的讨论范围，故按下不表。

![vscode-cpp-project](https://img.blessing.studio/images/2019/12/19/vscode-cpp-project.png)

<br>

**参考链接：**

- [C++ programming with Visual Studio Code](https://code.visualstudio.com/docs/languages/cpp)
- [Get Started with C++ and Mingw-w64 in Visual Studio Code](https://code.visualstudio.com/docs/cpp/config-mingw)
- [Get Started with C++ and Windows Subsystem for Linux in Visual Studio Code](https://code.visualstudio.com/docs/cpp/config-wsl)
- [Visual Studio Code Variables Reference](https://code.visualstudio.com/docs/editor/variables-reference)
- [Support "Run without debugging" · Issue #1201 · microsoft/vscode-cpptools](https://github.com/Microsoft/vscode-cpptools/issues/1201)
