---
title: '可能是最好的 ss-panel 部署教程'
date: '2015-08-27 22:50:25'
updated: '2017-02-18 21:58:48'
categories: 技术
tags:
  - 教程
  - shadowsocks
---

今天折腾了好久 ss-panel，期间遇到了一些奇奇怪怪的问题，但是网上都没有好的解决方法。网上那么多教程有些是写得笼统，有些还是瞎复制的。由此萌生了想要写一篇配置 ss-panel 和 ss-manyuser 的教程，希望能够帮到需要的人。

> 注意，本教程 **不是** 图文并茂的面向小白的教程，窝希望你能够有足够的 Linux 操作经验再来看这篇教程。至少你需要熟悉 ssh 连接，熟悉 Web 环境的配置，最好可以看得懂一些代码。

## 一、安装并配置 ss-panel

本教程打算先配置好前端，当然你想要先配置后端可以拉下去。

### 0x01 环境要求

作为前端的 ss-panel 是使用 PHP 编写的网页应用程序，它对你的主机运行环境有一定的要求。

- PHP 5.6 或更高
- MySQL 5.5 或更高
- 支持 URL 重写的 Web 服务器（Nginx / Apache 均可）

本教程所使用的环境是 NGINX + PHP 7 + MariaDB 10。当然其他主流 LNMP/LAMP 架构都可以（个人推荐使用 [OneinStack](https://oneinstack.com/)），确保你的站点可以访问后就继续吧。

什么？你不知道上面说的那些东西是什么？那你为什么不问问[神奇海螺](https://www.google.com/)呢？

------------

**注意**，接下来的操作大部分都是在【目标服务器】的 shell 中进行的。继续阅读之前，你需要通过 SSH 等工具连接至你的服务器，它一般长这样：

![shell example](https://img.blessing.studio/images/2017/02/18/QQ20170218173516.png)

如果你不晓得这是什么，神奇海螺……以下略。

<!--more-->

### 0x02 下载 ss-panel 源码

ss-panel 的 GitHub 项目地址：[orvice/ss-panel](https://github.com/orvice/ss-panel)

使用 `cd` 进入你站点的 web 根目录，从 git 上 clone 源码：

```bash
# 最前面的美元符号是命令提示符，别把这个给一起输进去了
$ git clone https://github.com/orvice/ss-panel.git
```

当然你也可以下载源码再用 SCP/FPS 传到服务器上去。

注意源码下载完成后的目录结构，**请务必保证** `/public` 目录在站点的根目录下。你可以使用 `$ mv ss-panel/{.,}* ./` 命令将子目录的内容移动到当前目录来。正确的目录结构应该类似于这样：

![directory structure example](https://img.blessing.studio/images/2017/02/18/QQ20170218174949.png)

### 0x03 配置 ss-panel

执行完上面的步骤之后，你兴高采烈地访问了你的站点，却得到了无情的 403 Forbidden —— 站点根目录下竟然没有 index.php！

好吧其实没什么好奇怪的，大部分 MVC 框架都将 `index.php` 的入口文件放到其他子目录下了，这样做是为了保护根目录下的配置文件等可能会导致信息泄露的敏感文件无法被访问。

接下来请按照 [官方文档的说明](https://sspanel.xyz/docs/intro/installation#%E6%9C%8D%E5%8A%A1%E5%99%A8%E9%85%8D%E7%BD%AE) 正确配置你的 Web 服务器。正确配置后的 NGINX 配置应该长这样：

![nginx configuration sample](https://img.blessing.studio/images/2017/02/18/QQ20170218180726.png)

编辑完后重载你的 Web 服务器，然后访问你的站点……于是你得到了一个 500 Internal Server Error（如果你没开启 `display_errors` 可能看不到详细报错）：

```
Warning: require(/home/wwwroot/ss.prinzeugen.net/vendor/autoload.php): failed to open stream: No such file or directory in /home/wwwroot/ss.prinzeugen.net/bootstrap.php on line 18

Fatal error: require(): Failed opening required '/home/wwwroot/ss.prinzeugen.net/vendor/autoload.php' (include_path='.:/usr/local/php/lib/php') in /home/wwwroot/ss.prinzeugen.net/bootstrap.php on line 18
```

这是我们还未安装 ss-panel 所需的依赖库导致的。遂安装之：


```bash
$ curl -sS https://getcomposer.org/installer | php
$ php composer.phar install
```

![installing dependencies with composer](https://img.blessing.studio/images/2017/02/18/QQ20170218181624.png)

等待它安装完毕后接着进行配置：

```bash
$ cp .env.example .env
```

将 `.env.example` 复制一份重命名为 `.env`，自行修改其中的数据库等信息。

```python
# database 数据库配置
db_driver = 'mysql'
db_host = 'localhost'
db_port = '3306'
db_database = 'ss-panel'
db_username = 'ss-panel'
db_password = 'secret'
db_charset = 'utf8'
db_collation = 'utf8_general_ci'
db_prefix = ''
```

数据库的创建我就不多说了，建站的一般都玩过数据库吧？将根目录下的 `db.sql` 导入到数据库中即可。其他配置自行修改。

![importing tables](https://img.blessing.studio/images/2017/02/18/QQ20170218183004.png)

你还需要修改 `.env` 中的 `muKey` 字段，修改为任意字符串（最好只包含 ASCII 字符），下面配置后端的时候我们需要使用到这个 `muKey`：

```
muKey = 'api_key_just_for_test'
```

接下来，确保 `storage` 目录可写入（否则 Smarty 会报错）：

```
$ chown -R www storage
```

现在访问你的站点，就可以看到 ss-panel 的首页啦：

![landing page](https://ooo.0o0.ooo/2017/02/18/58a82108b285e.png)


### 0x03 进入 ss-panel 后台

现在访问 http://your-domain/admin 就可以进入 ss-panel 后台了。

不过细心的你可能会注意到，刚才导入数据表的时候，user 表并没有添加记录，那要咋进管理后台呢？当然你可以在数据库中手动加一条记录，不过作者已经提供了一个更方便的方式：

```bash
$ php xcat createAdmin
```

在站点根目录下运行，根据提示即可创建管理员账号 ~~（这个文字对齐真鸡儿 shi）~~：

![creating admin account](https://img.blessing.studio/images/2017/02/18/QQ20170218184049.png)

使用刚才填写的邮箱和密码进入后台：

![ss-panel dashboard screenshot](https://ooo.0o0.ooo/2017/02/18/58a825580f6c3.png)

到这里，作为前端的 ss-panel 就已经配置完成了。下面开始部署作为后端的 `shadowsocks-manyuser`。

- - - - - - -

## 二、部署并配置 shadowsocks-manyuser

在本篇教程中我们使用 [fsgmhoward/shadowsocks-py-mu](https://github.com/fsgmhoward/shadowsocks-py-mu) 这个版本的后端。不同于这篇教程原先推荐的 [@mengskysama](https://github.com/mengskysama/shadowsocks-rm/tree/manyuser) 版本，这个后端支持使用 MultiUser API 与前端的 ss-panel 进行用户信息交互。

这个 API 的官方介绍在[这里](https://sspanel.xyz/docs/muapi)。简单来讲，如果你通过 API 来与前端通信，你就不需要修改后端的数据库配置了，并且可以使用「自定义加密」、「流量记录」等高级功能。下面我**只介绍**使用 API 的方法，另外那个比较麻烦的方法可以在[这里](https://github.com/fsgmhoward/shadowsocks-py-mu#install-instruction-for-database-user)查看。

### 0x01 安装 shadowsocks-manyuser

先将代码 clone 到本地：

```bash
$ git clone https://github.com/fsgmhoward/shadowsocks-py-mu.git
```

源码 clone 后，你的目录结构应该是这样的：

![directory structure ss mu](https://img.blessing.studio/images/2017/02/18/QQ20170218200629.png)

其中的 shadowsocks 子目录才是我们需要的，外面的是 `setup.py` 的相关文件。


### 0x02 配置 shadowsocks-manyuser

进入 `shadowsocks` 目录，将 `config_example.py` 复制一份到 `config.py`：

```bash
$ cp config_example.py config.py
```

修改其中第 15 行和第 29~31 行的内容：

```
# 启用 MultiUser API
API_ENABLED = True

# 就是在你的站点地址后面加个 /mu
API_URL = 'http://ss.prinzeugen.net/mu'
# 还记得上面在 .env 中填写的 muKey 吗？把它填在这里
API_PASS = 'api_key_just_for_test'
```

由于我们选择使用 Mu API 来与前端通信，所以我们**不需要**修改 `config.py` 中任何关于数据库的配置。

好了，现在可以试着运行一下 `$ python servers.py` 了（注意，是 **servers.py** 而不是 **server.py**）。如果没错的话，应该可以看到这样的输出：

![running successfully](https://img.blessing.studio/images/2017/02/18/QQ20170218203217.png)

其中 `P[XXX]` 表示用户端口，`M[XXX]` 表示加密方式，`E[XXX]` 表示用户的邮箱地址。这些都会随着 ss-panel 前端中用户配置的改变而实时变化。

### 0x03 常见错误 FAQ

连接上 shadowsocks 试试看能不能翻墙了？**八成不能**。

虽然你成功的把 servers.py 跑起来了，但还可能有各种神奇的错误阻止你翻出伟大的墙。

首先国际惯例查看连接：

```bash
$ netstat -anp | grep 你的端口
```

正常的话，应该是这样的：

```no-highlight
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:62111            0.0.0.0:*               LISTEN      32083/python
tcp        0      0 162.233.122.111:62111    115.233.233.140:47177   TIME_WAIT   -
tcp        0      0 162.233.122.111:62111    115.233.233.140:47161   TIME_WAIT   -
tcp        0      0 162.233.122.111:62111    115.233.233.140:47160   TIME_WAIT   -
tcp        0      0 162.233.122.111:62111    115.233.233.140:47157   TIME_WAIT   -
```

如果没有来自你的 IP 的 TCP 连接的话，那八成就是防火墙的锅了，执行 iptables 放行你的端口：

```bash
$ iptables -I INPUT -p tcp -m tcp --dport 你的端口 -j ACCEPT
$ iptables-save
```

> ss-panel 新注册的用户所分配的端口均为其 id-1 的用户的端口号 + 1。比如说你把 admin 用户（uid 为1）的端口改为 12450（ss-panel 中不能改，去数据库改），那么后面注册的新用户的端口就会是 12451, 12452 这样递增的。

所以如果你要开放注册，就要这样配置你的 iptables：

```bash
# 注意是半角冒号，意为允许 12450 及以上的端口
# 也可以指定 12450:15550 这样的范围
$ iptables -I INPUT -p tcp -m tcp --dport 12450: -j ACCEPT
```

现在再连接 shadowsocks 就应该可以看到 TCP 连接信息了。并且你可以在 ss-mu 后端的输出信息中看到详细的连接日志：

![connection log](https://ooo.0o0.ooo/2017/02/18/58a8420faee8c.png)

日志格式的详细介绍在这里：[Explanation of the log output](https://github.com/fsgmhoward/shadowsocks-py-mu#explanation-of-the-log-output)。

## 三、配置 ss-manyuser 守护进程以及多节点配置

### 0x01 使用 supervisor 监控 ss-manyuser 运行

如果你只是想让 ss-manyuser 在后台运行的话，可以参考我写的[这篇文章](https://prinzeugen.net/linux-tips-how-to-run-program-on-the-background)。

安装 supervisor （用的是上面安装过的 pip）：

```bash
# 先安装 pip 包管理器
$ sudo apt-get install python-pip  # For Debian/Ubuntu
$ sudo yum install python-pip      # For CentOS

$ pip install supervisor
```

创建 supervisor 配置文件

```bash
# 输出至 supervisor 的默认配置路径
$ echo_supervisord_conf > /etc/supervisord.conf
```

运行 supervisor 服务

```bash
$ supervisord
```

配置 supervisor 以监控 ss-manyuser 运行

```bash
$ vim /etc/supervisord.conf
```

在文件尾部（当然也可以[新建配置文件](http://supervisord.org/configuration.html)，不过这样比较方便）添加如下内容并酌情修改：

```ini
[program:ss-manyuser]
command = python /root/shadowsocks-py-mu/shadowsocks/servers.py
user = root
autostart = true
autorestart = true
```

其中 command 里的目录请自行修改为你的 `servers.py` 所在的绝对路径。

重启 supervisor 服务以加载配置

```bash
$ killall -HUP supervisord
```

查看 shadowsocks-manyuser 是否已经运行：

```bash
$ ps -ef | grep servers.py
root       952   739  0 15:40 ?        00:00:00 python /root/shadowsocks-rm/shadowsocks/servers.py
```

可以通过以下命令管理 shadowsock-manyuser 的状态

```bash
$ supervisorctl {start|stop|restart} ss-manyuser
```

### 0x02 ss-panel 的多节点配置

其实多节点也没咋玄乎，说白了就是多个后端共用一个前端而已。而且我们的后端是使用 Mu API 来与前端进行交互的，所以多节点的配置就更简单了：只要把所有后端的 `config.py` 中的 `API_URL` 和 `API_PASS` 都改成一样即可（记得 `API_ENABLED = True`）。

## 四、写在后面

其他可用的前端：

- [esdeathlove/ss-panel-v3-mod](https://github.com/esdeathlove/ss-panel-v3-mod)，修改版的 ss-panel，修改了蛮多东西的，有兴趣的朋友可以去看看，他那边安装说明都写得很详细了；
- [sendya/shadowsocks-panel](https://github.com/sendya/shadowsocks-panel)，另外一个全新的 ss-manyuser 前端，有用户等级、套餐、支付等功能，不支持使用 Mu API，部署教程在[这里](https://github.com/sendya/shadowsocks-panel/wiki/Shadowsocks-Panel-%E9%9D%A2%E6%9D%BF%E5%AE%89%E8%A3%85%E6%95%99%E7%A8%8B)。

其他可用的后端：

- [shadowsocks-go mu](https://github.com/catpie/ss-go-mu)，Go 语言实现，性能比 Python 版好，也支持 Mu API；
- [shadowsocksR manyuser](https://github.com/shadowsocksr/shadowsocksr) SSR 版本，见仁见智。

这几个后端的部署方法大同小异，我这里就不再赘述了。

#### 文章更新日志

- 2017-02-18
- 根据评论区推荐将后端由 [mengskysama/shadowsocks-rm/manyuser](https://github.com/mengskysama/shadowsocks-rm/tree/manyuser) 切换至 [fsgmhoward/shadowsocks-py-mu](https://github.com/fsgmhoward/shadowsocks-py-mu)；
- 所有后端配置均改用 [Mu API v2](https://sspanel.xyz/docs/muapi/v2) 的方法；
- 使用了更加严谨的文法。

--------------

![success google](https://img.blessing.studio/images/2017/02/18/QQ20170218213554.png)

至此，你已完成对 ss-panel 的部署。叫上小伙伴们一起享受自由的互联网吧 ;)

如果碰到什么奇怪的错误，请评论留言（带上你的日志）
