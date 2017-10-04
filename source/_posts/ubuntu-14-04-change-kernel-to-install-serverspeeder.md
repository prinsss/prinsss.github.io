---
title: 'Ubuntu 14.04 更换内核以安装锐速'
date: '2015-08-02 21:59:55'
updated: '2016-03-06 07:58:17'
categories: 技术
tags:
  - Linux
  - 锐速
---


想安装锐速，然而窝的俩 VPS 内核都不被锐速支持，只好自己更改内核。DigitalOcean 可以直接在控制面板里更改内核，然而 ConoHa 的控制面板就没有那么强大了，要靠窝们自己手动修改内核 (´_ゝ)

### 1.查看当前系统内核

一般 ssh 登录信息页就可以看到内核信息了，比如窝是：

*Welcome to Ubuntu 14.04.2 LTS (GNU/Linux 3.16.0-36-generic i686)*

或者使用 `uname -r`  查看

### 2.安装新内核

锐速支持的内核可以在[这里](http://my.serverspeeder.com/ls.do?m=availables)查看，窝要安装的是 *3.13.0-24-generic*

```
$ sudo apt-get install linux-image-extra-3.13.0-24-generic
```

### 3.卸载其他内核

查看系统现有内核 
```
$ dpkg -l|grep linux-image  
```
卸载列出的其他内核：
```
$ sudo apt-get purge linux-image-3.16.0-36-generic linux-image-extra-3.16.0-36-generic
```

### 4.更新 grub 系统引导文件并重启
```
$ sudo update-grub 
$ sudo reboot
```
不出意外的话重启后启用的就是新的内核了~

[![kernel](https://img.blessing.studio/images/2015/08/2015-08-02_05-51-37.png)](https://img.blessing.studio/images/2015/08/2015-08-02_05-51-37.png)

安装锐速请看[这篇博文](https://prinzeugen.net/use-serverspeeder-to-speed-up-your-shadowsocks/)~ (σﾟ∀ﾟ)σ



