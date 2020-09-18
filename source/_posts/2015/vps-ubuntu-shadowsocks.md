---
title: 'VPS 部署 shadowsocks 服务器'
date: '2015-07-09 02:15:33'
updated: '2015-09-01 07:04:12'
categories: 技术
tags:
  - shadowsocks
  - VPS
---

**UPDATE：**窝基于此教程的内容写了个一一键安装脚本，具体可以[看这里](https://prinzeugen.net/shadowsocks-install-shell/)。

----------

就在刚才咱买的ss服务过期了，vps又买到了，自然是在vps上搭个ss来爬墙 ![i_f25](https://img.prin.studio/images/2015/03/i_f25.png)

### ssh 上 vps，apt-get

```
apt-get install python-pip m2crypto supervisor pip install shadowsocks
```

![20150708170216](https://img.prin.studio/images/2015/07/2015-07-08_09-49-56.png)

### 编辑 `/etc/shadowsocks.json` （咱用的是vim

`vim /etc/shadowsocks.json` ip、端口、密码自己填

```
{
    "server":"123.123.123.123",
    "server_port":62121,
    "local_port":1080,
    "password":"my password",
    "timeout":600,
    "method":"aes-256-cfb"
}
```

<!--more-->

### 编辑 ``/etc/supervisor/conf.d/shadowsocks.conf`

```
[program:shadowsocks]
command=ssserver -c /etc/shadowsocks.json
autorestart=true
user=nobody
```

### 编辑 `/etc/default/supervisor` ，在最后一行添加

```
ulimit -n 51200
```

或者直接 shell `echo "ulimit -n 51200" >> /etc/default/supervisor`

### 运行 supervisor

```
service supervisor start supervisorctl reload
```

如果出现以下错误：`Error: Another program is already listening on a port that one of our HTTP servers is configured to use. Shut this program down first before starting supervisord.`，尝试输入 `sudo unlink /tmp/supervisor.sock` 然后启动 supervisor 服务。

### 通过以下命令管理 shadowsocks 进程:

```
supervisorctl start shadowsocks supervisorctl stop shadowsocks
```

### 此时还需要更改下 iptables 设置

```
iptables -I INPUT -p tcp -m tcp --dport 62121 -j ACCEPT //改为你设置的端口号
iptables-save
```

至此 shadowsocks 部署完成。

![20150708175558](https://img.prin.studio/images/2015/07/2015-07-08_10-03-53.png)

-----------

本文自 [http://www.chedanji.com/ubuntu-shadowsocks/](http://www.chedanji.com/ubuntu-shadowsocks/) ，略有修改
