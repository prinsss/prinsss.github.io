---
title:   'Windows 更改 cmd 字体'
date:    '2015-06-20 02:48:57'
updated: '2015-09-16 06:03:10'
categories: 技术
tags:
  - Windows
  - 工具
---

那个点阵字体真tm的难看，最近经常用 cmd，就去找了找方法，整理如下：

1. 打开regedit，进入 `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Console\TrueTypeFont`
2. 添加新字符串值 `000`（原来有 `000` 的话就添加 `0000`），设置值为字体名称（字体名称可在这里查看 `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts`，窝当然是用窝大 [Source Code Pro](https://github.com/adobe-fonts/source-code-pro/releases) 辣）<!--more-->
3. 然后在 cmd 里输入 `chcp 850` 修改 cmd 的编码集
4. 在cmd标题栏「右键 > 设置」即可看到新字体啦~ 然后加上半透明，超SAO ![emotion](https://img.prin.studio/images/2015/06/2015-06-04_23-31-30.jpg)

![source code pro cmd](https://img.prin.studio/images/2015/06/2015-06-19_10-32-06.png)
