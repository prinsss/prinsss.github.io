---
title: 类比 systemd 的 macOS launchd 使用笔记
date: '2026-02-02 10:22:00'
updated: '2026-02-02 10:22:00'
categories: 技术
tags:
  - macOS
  - Linux
  - 笔记
---

现在各大 Linux 发行版很多都变成 systemd 的形状了，连 Synology DSM 7 都开始用 systemd 了，可以说是 Learn once, operate anywhere。不过有时候还是要在 Mac 机器上部署一些服务，需要用到 launchd/launchctl。

本文以一个熟悉 systemd/systemctl 工具的运维视角，整理了常用的 launchd 相关命令备忘。（说实话我每次都会忘记怎么用，然后得去翻手册……而且网上有时候还会教你用 load/unload 子命令，这些其实都已经标记为过时了，有新的命令替代它们）

<!--more-->

## list 查看所有

```bash
launchctl list

# 类比 systemctl list-units
```

## status 查看状态

```bash
launchctl print gui/501/uploadserver
# -> ~/Library/LaunchAgents/uploadserver.plist

launchctl print system/com.openssh.sshd
# -> /System/Library/LaunchDaemons/ssh.plist

# 类比 systemctl status uploadserver.service
# -> /etc/systemd/system/uploadserver.service
```

这里的 `system/` `gui/501/` 叫做 domain-target，`com.openssh.sshd` 和 `uploadserver` 叫做 service-name，合起来之后叫做 service-target。`service-name` 一般就是下面 .plist 配置文件中的 Label。

其中 `system/` 顾名思义就是系统级的，system domain，需要 root 权限才能修改。而 `gui/501/` `user/501/` 则是用户级的 user domain，其中 501 就是用户 uid。`gui/<uid>/` 和 `login/<asid>/` 下的服务只有用户登录了才会运行。

通常来说需要 GUI 运行的放在 `gui/<uid>/` 下面，不需要的放在其他下面。不过考虑到 macOS 作为桌面操作系统的特性，其实一股脑都放 gui 下面也没啥问题。

## start 启动

```bash
launchctl bootstrap gui/501 ~/Library/LaunchAgents/uploadserver.plist

# 或者系统级的服务，需要 sudo 运行
sudo launchctl bootstrap system /Library/LaunchDaemons/com.example.plist

# 类比 systemctl start uploadserver.service
# 不需要 systemctl daemon-reload
```

如果 bootstrap 提示下面的报错，就说明很可能是服务器已经在运行了，或者服务被 disable 掉了：

```text
Bootstrap failed: 5: Input/output error
Try re-running the command as root for richer errors.
```

## stop 停止

```bash
launchctl bootout gui/501 ~/Library/LaunchAgents/uploadserver.plist

# 或者系统级的服务，需要 sudo 运行
sudo bootout bootstrap system /Library/LaunchDaemons/com.example.plist

# 除了 .plist 文件路径，也可以用 label 指定
launchctl bootout gui/501/uploadserver

# 类比 systemctl stop uploadserver.service
```

如果 bootout 提示下面的报错，就说明很可能是服务本来就没有在运行：

```text
Boot-out failed: 3: No such process
```

## restart 重启

```bash
launchctl kickstart -k -p gui/501/uploadserver
# service spawned with pid: 17247

# 参数：
# -k       如果服务已经在运行了，先杀死现有的进程再重启
# -p       成功后输出进程的 PID

# 类比 systemctl restart uploadserver.service
```

如果 kickstart 提示下面的报错，就说明服务没有 bootstrap：

```text
Could not find service "uploadserver" in domain for user gui: 501
```

## enable 开机启动

一般来说你的 .plist 里配置了 `RunAtLoad` 的话，bootstrap 了之后默认就是开机启动的，不需要再 enable 一遍。

不过你也可以通过 disable 主动关闭服务的开机启动，这个是否 enable 的状态是 launchd 自己维护的，不会更改 .plist 文件的内容。使用 disable 禁止开机启动之后，想要恢复开机启动就需要用 enable。

```bash
launchctl enable gui/501/uploadserver

# 类比 systemctl enable uploadserver.service
```

## disable 禁止开机启动

```bash
launchctl disable gui/501/uploadserver

# 类比 systemctl disable uploadserver.service
```

## config 配置文件

类似于 systemd 的 Unit File，以 .plist/XML 文件的形式存在：

```text
~/Library/LaunchAgents   Per-user agents provided by the user.
/Library/LaunchAgents    Per-user agents provided by the administrator.
/Library/LaunchDaemons   System-wide daemons provided by the administrator.
/System/Library/LaunchAgents   Per-user agents provided by Apple.
/System/Library/LaunchDaemons  System-wide daemons provided by Apple.
```

通常来说我们只会用到前三个。Daemon 和 Agent 的区别：

- Daemon：系统级、单个实例服务多个用户、不应显示 UI、没有用户登录也会运行、可以以 root 权限运行。
- Agent：每个用户各自运行实例、直接与用户交互、用户不登录则不会运行、以普通用户权限运行。

这里以 `~/Library/LaunchAgents/uploadserver.plist` 为例：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>KeepAlive</key>
    <true/>
    <key>Label</key>
    <string>uploadserver</string>
    <key>LimitLoadToSessionType</key>
    <array>
        <string>Aqua</string>
        <string>Background</string>
        <string>LoginWindow</string>
        <string>StandardIO</string>
        <string>System</string>
    </array>
    <key>ProcessType</key>
    <string>Background</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/uvx</string>
        <string>uploadserver</string>
        <string>8888</string>
        <string>-d</string>
        <string>/tmp/upload</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>EnvironmentVariables</key>
    <dict>
        <key>FOO</key>
        <string>BAR</string>
    </dict>
    <key>StandardErrorPath</key>
    <string>/tmp/uploadserver.log</string>
    <key>StandardOutPath</key>
    <string>/tmp/uploadserver.log</string>
    <key>TimeOut</key>
    <integer>5</integer>
</dict>
</plist>
```

类比 `/etc/systemd/system/uploadserver.service`：

```
[Unit]
Description=Upload Server
Wants=network-online.target
After=network-online.target

[Service]
ExecStart=/root/.local/bin/uvx uploadserver 8888 -d /tmp/upload
Restart=always
RestartSec=5
Environment="FOO=BAR"
StandardOutput=file:/tmp/uploadserver.log
StandardError=file:/tmp/uploadserver.log

[Install]
WantedBy=multi-user.target
```

具体怎么写就不多说了，大部分开机自启 + 守护进程需求用上面的模板就够了，有其他需求的直接看文档。

名字基本可以随便取。另外注意有多个命令行参数的话，要拆成多个 `<string>`。

## 不再推荐使用的 Legacy 命令

现在很多教程里还在用 load/unload，不过在 macOS 10.11 之后，官方手册中已经不再推荐使用这些老的命令，应该使用上面的命令替代。

**另外一点需要注意的是，load/unload 通过执行 launchctl 命令时的权限来决定 domain。**如果使用 `sudo launchctl` 执行的，算作 system domain，否则算作 user domain。之前被坑过一次……💩

```bash
launchctl load ~/Library/LaunchAgents/uploadserver.plist
# 应该替换为 launchctl bootstrap gui/501 ~/Library/LaunchAgents/uploadserver.plist

launchctl load -w ~/Library/LaunchAgents/uploadserver.plist
# 相当于先 enable 再 bootstrap

launchctl unload ~/Library/LaunchAgents/uploadserver.plist
# 应该替换为 launchctl bootout gui/501 ~/Library/LaunchAgents/uploadserver.plist

sudo launchctl load /Library/LaunchDaemons/com.example.plist
# 应该替换为 sudo launchctl bootstrap system /Library/LaunchDaemons/com.example.plist

sudo launchctl unload /Library/LaunchDaemons/com.example.plist
# 应该替换为 sudo bootout bootstrap system /Library/LaunchDaemons/com.example.plist
```

## 可视化管理工具

推荐 [Lingon X](https://www.peterborgapps.com/lingon/)，有点像以前 Windows 上的那种开机进程管理，可以查看当前系统上有哪些 Agent/Deamon，以及它们的配置，挺方便的。

## 小尾巴

我记得以前 macOS 设置页面里的启动项管理很垃圾，只能显示部分启动项，但实际上程序想要开机自启有很多种方法：

- LoginItems (Helper App with `SMLoginItemSetEnabled`)
- LaunchAgents (`~/Library/LaunchAgents` or `/Library/LaunchAgents`)
- LaunchDaemons (`/Library/LaunchDaemons`)
- 直接拖动到设置页面「登录时打开」列表中

搞得有些流氓软件开机自启了你都不知道，比之 Windows 还不如。当时我还准备写篇博客，在不安装第三方清理软件的情况下如何删除这些启动项，但后来不了了之了。

不过好在后来的 macOS 更新把这块的管理补上了，现在在设置页面就可以直接管理上面那些方式添加的启动项，挺好。
