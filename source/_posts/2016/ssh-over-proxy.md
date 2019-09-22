---
title: '通过 Socks5 代理进行 SSH 连接'
date: '2016-01-25 00:23:20'
updated: '2016-01-31 00:59:00'
categories: 技术
tags:
  - SSH
---

为什么要写这个呢？

这次 ConoHa 把我被 DDoS 的 VPS 所有对外连接 DROP 了。最开始是所有的连接都 DROP，只有控制台的 VNC 才连的上。连上以后只能 Ping 到内网。

所幸后来放宽了 DROP，日本的 IP 可以访问了。于是借用了同学的搭建于 ConoHa 的 Shadowsocks，准备把数据备份下来（ConoHa 删除被 D 主机不是一次两次了）。

那么要怎么样才能通过代理进行 SSH 连接呢？窝起先以为是像 curl 那样提供了参数，不曾想 man ssh 未果，只好 Google 解决方法。不过大部分都是搜到了 SSH 代理的教程，找了挺久的，为了让后来人少走弯路，遂记录一下。

下面介绍的是 connect 的使用方法，Corkscrew 可以看[这篇](http://www.techrepublic.com/blog/linux-and-open-source/using-corkscrew-to-tunnel-ssh-over-http/)。

### 0x01 下载并安装 connect

这是 connect 的 Bitbucket [项目地址](https://bitbucket.org/gotoh/connect/src)。

如果你是 Linux/Mac 用户，克隆项目到本地（然而窝不用 Mercurial），编译安装：

```bash
$ hg clone https://bitbucket.org/gotoh/connect 
$ cd connect 
$ make && make install
```

也可以：

```bash
$ gcc connect.c -o connect 
$ cp connect /usr/local/bin
```

如果你是 Windows 下的 Cygwin 用户，直接下载发行的[二进制文件](https://bitbucket.org/gotoh/connect/downloads)到 `C:/Windows` 中即可

### 0x02 配置 SSH

如果你使用的是 socks5 代理（Shadowsocks），添加这两行到 `~/.ssh/config`

```
Host * 
    ProxyCommand connect -H 127.0.0.1:1080 %h %p
```

如果你是使用 HTTP 代理，将 -H 改为 -S。

### 0x03 连接

![success](https://img.blessing.studio/images/2016/01/2016-01-24_08-19-25.png)

成功

- - - - - -

~~装逼地使用了十六进制的标题序号~~



