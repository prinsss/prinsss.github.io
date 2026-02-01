---
title: 禁止 Synology/QNAP NAS 通过 ssh 密码登录
date: '2026-02-02'
updated: '2026-02-02'
categories: 技术
tags:
  - NAS
  - 笔记
---

使用成品 NAS，在相对省心的同时，也意味着更低的自由度。很多自定义操作都是在和这些定制化 OS 斗智斗勇。

本文介绍了在 QNAP 威联通 NAS（以及 Synology 群晖 NAS）上关闭 ssh 密码登录，仅允许密钥登录的方法。Synology 相对还好，对 OpenSSH 的魔改不多，和普通 Linux 一样修改 `/etc/ssh/sshd_config` 就好了。

但是 QNAP 这个 B，每次启动 sshd 服务都会重新生成配置，直接修改上述配置文件是没法持久化保存的。

<!--more-->

## 风险提示

为了避免你被锁在门外，修改自带 sshd 配置之前，最好自己再起一个 ssh 服务，等确认 OK 了之后再关掉。**以及最重要的，做好备份！**

```bash
sudo opkg install dropbear
sudo dropbear -F -p 9922 -P /opt/var/run/dropbear.pid -R -w -E
```

如果你不幸已经进不去系统了，可以这样自救（别问我为什么知道🤣）：

- 从 Web UI 打开 Container Station / Container Manager
- 通过上传 docker-compose.yml 的方式创建容器（通常方式创建的话是不让挂载特殊路径的）
- 挂载要修改的路径，比如 `/etc/init.d/`
- 启动容器后，选择 打开终端机/连接终端，然后把改坏的文件改回来

```yaml
services:
  rescue-tmp:
    image: ubuntu:latest
    container_name: rescue-tmp
    stdin_open: true
    tty: true
    command: /bin/bash
    volumes:
      - /etc/init.d:/work
```

## Synology NAS

> ⚠ **改文件之前做好备份！**

执行 `sudo vim /etc/ssh/sshd_config`，修改：

```diff
 PubkeyAuthentication yes
 ChallengeResponseAuthentication no

-PasswordAuthentication yes
+PasswordAuthentication no
```

然后 `sudo synosystemctl restart sshd.service` 重启 sshd 生效，或者在 DSM Web UI 上关闭「启动 SSH 功能」后再打开也可以。

值得一提的是，直接修改 `sshd_config` 中的 `Port`，会导致 sshd 监听在两个端口上，一个是 Web UI 上设置的「SSH 端口」，一个是配置文件中配置的端口，而且后者是无法用于登录 Shell 的，会提示 `Permission denied, please try again.`。

研究了一下，应该是因为 sshd 被魔改过，会读取 `/etc/synoinfo.conf` 文件里的 `ssh_port` 配置。

```bash
sudo lsof -c sshd
# COMMAND   PID USER  FD   TYPE  SIZE/OFF    NODE NAME
# sshd    28232 root cwd    DIR      4096       2 /
# sshd    28232 root rtd    DIR      4096       2 /
# sshd    28232 root txt    REG    888480   20645 /usr/bin/sshd
# sshd    28232 root   3u  IPv4       0t0     TCP *:2222 (LISTEN)
# sshd    28232 root   4u  IPv6       0t0     TCP *:2222 (LISTEN)
# sshd    28232 root   5u  IPv4       0t0     TCP *:6622 (LISTEN)
# sshd    28232 root   6u  IPv6       0t0     TCP *:6622 (LISTEN)

cat /etc/synoinfo.conf | grep -i port
# ssh_port="2222"
# sftpPort="3322"
# rsync_sshd_port="4422"

strings /usr/bin/sshd
# SYNOServiceSSHPortGet
# /etc/ssh/sshd_config
# /etc/synoinfo.conf
# Permission denied, please try again.
```

而根据 [Reverse Engineering Synology's OpenSSH](https://wrgms.com/reverse-engineering-synology-openssh/) 这篇博客里的说法，这个魔改过的 OpenSSH 会校验一些参数，所以无法连接。

不过对于我们的目标「禁用 ssh 密码登录」没什么影响，就这样吧。这些厂商定制化的东西还是少碰，别给整挂了。

## QNAP NAS

大的来了（掩鼻）。

先看看 QNAP 的 sshd 用的什么配置文件：

```bash
ps aux | grep sshd
# 22714 admin     11504 S   /usr/sbin/sshd -f /etc/config/ssh/sshd_config -p 2222

cat /etc/config/ssh/sshd_config
# Protocol 2
# HostKey /etc/ssh/ssh_host_ed25519_key
# PermitRootLogin yes
# UseDNS no
# Subsystem sftp /usr/libexec/sftp-server
# AllowTcpForwarding yes
# AllowUsers admin prin

echo 'PasswordAuthentication no' | sudo tee -a /etc/config/ssh/sshd_config
```

重启 sshd 后，你会惊喜地发现，刚才改掉的配置文件，诶，又被改回来了😁：

```bash
sudo setsid /etc/init.d/login.sh restart

grep PasswordAuthentication /etc/config/ssh/sshd_config
```

既然配置文件没法持久化，那就只能从启动脚本下手了。

简单看看 `/etc/init.d/login.sh`（文件缩进就是这样，我保留了原汁原味）：

```bash
SSH=/usr/sbin/sshd
SSHD_CONF=/etc/config/ssh/sshd_config
SSHD_CONF_DEFAULT=/etc/ssh/sshd_config
SSH_PORT=`/sbin/getcfg LOGIN "SSH Port" -d 22`

update_sshd_config()
{
 /sbin/mksshdconf
 ENABLED_SFTP=`/sbin/getcfg LOGIN "SFTP Enable" -u -d TRUE`
 # ...
 #Set PermitRootLogin yes
 OPTION="PermitRootLogin"
 if [ -z "`grep .*${OPTION}.* ${SSHD_CONF}`" ]; then
     echo "${OPTION} yes" > ${SSHD_CONF}
 else
        sed -i "s/^#\s\?${OPTION}\s\?[yesno]\{1,3\}.*/${OPTION} yes/g" ${SSHD_CONF}
 fi
 # ...
}

# ...
case "$1" in
    start)
 # for openssh 7.5p1 and later
 sed -i '/^UsePrivilegeSeparation .*/d' ${SSHD_CONF_DEFAULT}

 /bin/chmod 0400 /etc/config/shadow* /etc/default_config/shadow
 update_ssh_client_config
 if [ `/sbin/getcfg LOGIN "SSH Enable" -u -d FALSE` != FALSE ]; then
  echo -n "Starting sshd service: "
  generte_ssh_key
     if [ ! -f "${SSHD_CONF}" ]; then
      /bin/cp -f ${SSHD_CONF_DEFAULT} ${SSHD_CONF}
     fi
     if [ ! -f "${SSHD_CONF}" ]; then
      SSHD_CONF=${SSHD_CONF_DEFAULT}
     fi
  update_sshd_config
        sshd_privilege_separation
  /sbin/daemon_mgr sshd start "$SSH -f ${SSHD_CONF} -p $SSH_PORT"
  echo "OK"
  touch /var/lock/subsys/sshd
 fi
 ;;
 # ...
esac
```

你可能以为有这个 `cp -f ${SSHD_CONF_DEFAULT} ${SSHD_CONF}`，我们就能通过修改 `/etc/ssh/sshd_config` 来实现配置持久化了 —— 天真！

实测下来发现 `/sbin/mksshdconf` 这个二进制每次执行都会重置 `/etc/config/ssh/sshd_config` 的内容，所以你 cp 了也没有用。我也不知道他们为什么要写一个没有意义的 cp 在那里。🤷

我搜了下，[这篇博客](https://i.am.eddmil.es/posts/ssh-certificates/) 里也有类似的吐槽：

> For reasons I can’t fathom, the SSH config on a QNAP seems nuts (If anyone knows why it works this way, please let me know, because I must be missing something obvious).

就算抛开这些不谈，你这个强制 `PermitRootLogin yes` 是何意啊？

所以我们还是只能改脚本，重启 sshd 后生效：

> ⚠ **改文件之前做好备份！**

```diff
--- /etc/init.d/login.sh.bak
+++ /etc/init.d/login.sh
@@ -83,6 +83,9 @@
 update_sshd_config()
 {
  /sbin/mksshdconf
+ echo 'PasswordAuthentication no' >> ${SSHD_CONF}
+ echo 'ChallengeResponseAuthentication no' >> ${SSHD_CONF}
+ sed -i "s/PermitRootLogin yes/PermitRootLogin no/g" ${SSHD_CONF}
  ENABLED_SFTP=`/sbin/getcfg LOGIN "SFTP Enable" -u -d TRUE`

  if [ "x${ENABLED_SFTP}" = "xTRUE" ]; then
```

注意：系统更新后这个脚本会被重置，需要重新修改。

## Bonus: macOS

其实和大部分 Linux 一样啦，写在这里只是为了顺便记一下：

```bash
cat << EOF | sudo tee /etc/ssh/sshd_config.d/10-no-passwords.conf
PubkeyAuthentication yes
PasswordAuthentication no
KbdInteractiveAuthentication no
EOF
```

`sshd_config.d` 里的序号规则是 [小的覆盖大的](https://utcc.utoronto.ca/~cks/space/blog/sysadmin/OpenSSHConfigOrderMatters)。

重启 sshd：

```bash
# Linux systemd
systemctl restart ssh.service
systemctl status ssh.service

# macOS launchd
launchctl kickstart -k -p system/com.openssh.sshd
launchctl print system/com.openssh.sshd
```

让 VNC 远程桌面只能通过 ssh 隧道连接（[仅监听 127.0.0.1](https://gist.github.com/jabenninghoff/a0341af66b3e156ab07fd2c5fdba614c)）：

```bash
sudo defaults write /Library/Preferences/com.apple.RemoteManagement.plist VNCOnlyLocalConnections -bool yes

ssh -L 5900:127.0.0.1:5900 mac-mini
```

## 小尾巴

保不齐这些 NAS 系统后续更新会出什么幺蛾子，可以让 AI 搓一个脚本，放在 Docker 容器里 crontab 定时运行，然后给一个服务器列表，一旦发现任何服务器允许 PasswordAuthentication，就发送通知告警。

修改后的效果：

```bash
ssh -o PreferredAuthentications=password,keyboard-interactive prin@192.168.1.10 -p 2222
# prin@192.168.1.10: Permission denied (publickey).

ssh -o PreferredAuthentications=password,keyboard-interactive prin@192.168.2.10 -p 2222
# prin@192.168.2.10: Permission denied (publickey).
```
