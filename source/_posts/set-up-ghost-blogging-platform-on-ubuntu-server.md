---
title: '在 Ubuntu 服务器上部署 Ghost 博客程序'
date: '2015-08-22 05:03:09'
updated: '2016-04-29 21:32:42'
categories: 技术
tags:
  - Ghost
  - Linux
  - 博客
---

{% alert danger %}
本文已废弃。
排版的错误是由于 WordPress 转换至 Ghost 文章所致，懒得改了（笑
{% endalert %}

虽然说网上有很多部署 Ghost 的教程了，官方[中文文档](http://docs.ghost.org/zh/installation/)也已经很完善了。但看了大多数的教程，都感觉叙述了太多冗余内容，譬如说 安装并配置 nginx、apache、mysql 等，甚至有些还教了如何使用 ssh。窝这里希望写的是干净、优雅、易懂的教程，并标出容易踩坑的地方。

## 教程目录：（点击展开）

- **一、安装所需环境**
- 1.1 Node.js
- 1.2 Nginx/Apache，Mysql
- **二、下载安装 Ghost**
- 2.1 建立 Ghost 所使用的 mysql 数据库
- 2.2 下载 Ghost 最新版本 v0.6.4
- 2.3 安装 Ghost
- **三、配置 Ghost**
- 3.1 使你的 Ghost 可以被外网访问
- 3.2 使你的 Ghost 持久运行
- 3.3 配置 nginx 使 ghost 可以使用域名访问
- **四、Ghost 优化**

页内标签跳转等有空再做吧~

----------

</div>本教程所使用的环境以及所需材料：

- Ubuntu 14.04 VPS 或其他
- 一颗折腾的心
- 熟练运用搜索引擎的技能


## 一、安装所需环境

### 1.1 Node.js

Ghost 构建于 Node.js 平台之上，支持 0.10.* 版本（最新稳定版）的 Node.js。

**什么是 Node.js ？**

> Node.js 是一个开放源代码、跨平台的、用于服务器端和网络应用的运行环境。Node.js 应用用 JavaScript 语言写成，在 Node.js 运行时运行。Node.js 主要用于编写像 Web 服务器一样的网络应用，提供事件驱动和非阻塞 I/O API，可优化应用程序的吞吐量和规模。 From [Wikipedia](https://zh.wikipedia.org/wiki/Node.js)

顺带一提 Node.js 的衍生版本 io.js 也可以，这里就不介绍了。

直接使用软件包管理器安装 Node.js 即可

$ sudo apt-get install node.js nodejs-legacy npm

安装完成后可以使用 <span class="lang:default decode:true crayon-inline ">node -v</span>  和 <span class="lang:default decode:true crayon-inline ">npm -v</span>  查看版本信息 

<!--more-->

### 1.2 Nginx/Apache，Mysql

这里不再赘述，网上教程一搜一大把。


## 二、下载安装 Ghost

### 2.1 建立 Ghost 所使用的 mysql 数据库

同样不多说，自行创建一个。当然你也可以使用 SQLite。

### 2.2 下载 Ghost 最新版本 v0.6.4

> 英文原版：[https://ghost.org/download/](https://ghost.org/download/)
>
> 汉化版：[http://www.ghostchina.com/download/](http://www.ghostchina.com/download/)

下哪个随你喜欢，原版的话洋文应该不是问题，主要是后期需要对国内网络情况做一些优化。另外，国内 VPS 请使用 ghostchina 提供的源码完整包，不然伟大的墙会造成安装依赖包失败。

下载到 VPS 上并解压：

$ mkdir ghost && cd ghost $ wget https://ghost.org/zip/ghost-0.6.4.zip $ unzip -d ./ ghost-0.6.4.zip

解压时可能会提示未安装 unzip，<span class="lang:default decode:true crayon-inline ">$ sudo apt-get install unzip</span>  即可

### 2.3 安装 Ghost

确保你现在所处的目录下有 *npm-shrinkwrap.json* 后：

$ npm install --production

安装完毕后启动 Ghost：

$ npm start --production

这样 Ghost 就会监听在 *localhost:2368* 上了

可以使用 <span class="lang:sh decode:true crayon-inline ">$ curl http://127.0.0.1:2368</span>  查看是否返回 html 页面


## 三、配置 Ghost

### 3.1 使你的 Ghost 可以被外网访问

很好。你现在 curl 已经可以得到正确的 html 页面了，于是你兴高采烈地在浏览器中输入 http://your-ip:2368/ 。。

[![boom~](https://img.blessing.studio/images/2015/08/2015-08-21_13-27-38.png)](https://img.blessing.studio/images/2015/08/2015-08-21_13-27-38.png)

Oh…What The Fuck !!! 明明本地 curl 都可以 get 到页面的啊！而且 log 上也完全没有滚动。。

最初窝以为是 iptables 的问题。但是执行 <span class="lang:sh decode:true crayon-inline ">$ sudo iptables -A INPUT -p tcp –dport 2368 -j ACCEPT</span>  后还是同样的问题。网上搜了搜，有人说将 **config.js** 中的 **127.0.0.1** 改成 **0.0.0.0** 就好了，于是窝就去试了一下：

[![ghost-done](https://img.blessing.studio/images/2015/08/2015-08-21_13-32-15-1024x502.png)](https://img.blessing.studio/images/2015/08/2015-08-21_13-32-15.png) wow~液！It works !! XD

不过只知其然，不知其所以然是不行的，窝自然要去搜索下 *127.0.0.1* 与 *0.0.0.0* 之间的区别

这是有用的链接：[@stackoverflow](http://stackoverflow.com/questions/20778771/what-is-the-difference-between-0-0-0-0-127-0-0-1-and-localhost)，窝简单翻译一下：

> 127.0.0.1 是本地环回地址，专门用于本地访问。这一般用于本地调试程序，譬如架设专门服务于本地客户端的服务端。然而一台主机可能有多个网卡或 IP 地址，监听在 0.0.0.0 上即为监听在所有可用的 IP 地址上。

渣翻译，轻喷 qwq。反正就是这么个意思~

顺带一提，如果按照下面的方法配置 nginx 反代后，nginx 以本地应用身份访问 127.0.0.1 就完全没有问题了。你也可以不改动这些，直接配置 nginx 反代即可。

### 3.2 使你的 Ghost 持久运行

可以外网访问了，于是你高兴地关掉终端想在 Ghost 上写第一篇文章，然后你发现。。

> 未收到数据
>
> ERR_EMPTY_RESPONSE

关掉 ssh 连接就不能访问了！如何解决呢？

#### 1) 使用 Supervisor

为啥把 supervisor 放在第一位而不是 forever 呢？也不是因为他俩的优缺点，只是因为上次[安装 shadowsocks](https://prinzeugen.net/vps-ubuntu-shadowsocks/) 时就已经安装了 supervisor 了，可以直接拿来用嘛

对于没有安装的人：

$ sudo apt-get install supervisor

为 ghost 创建一个启动脚本

$ vim /etc/supervisor/conf.d/ghost.conf

加入如下内容：

[program:ghost] command = node /path/to/ghost/index.js directory = /path/to/ghost user = ghost autostart = true autorestart = true stdout_logfile = /var/log/supervisor/ghost.log stderr_logfile = /var/log/supervisor/ghost_err.log environment = NODE_ENV="production"

记得把路径改成自己的。

**注意**，你现在**并没有**添加 ghost 用户，请使用 <span class="lang:default decode:true crayon-inline ">$ sudo useradd -r ghost -U</span>  添加并使用

<span class="lang:default decode:true crayon-inline">$ sudo chown -R ghost:ghost /your-ghost-dir</span> 赋予权限。

顺带一提，如果你的 ghost 放在 root 下（和窝一样）就要把 user 改成 root

重启 supervisor 服务

<span class="lang:sh decode:true crayon-inline ">$ sudo service supervisor restart</span>

可以使用 <span class="lang:sh decode:true crayon-inline ">$ supervisorctl {start|stop|restart} ghost</span>  管理

#### 2) 使用 forever

[http://docs.ghost.org/zh/installation/deploy/#forever](http://docs.ghost.org/zh/installation/deploy/#forever-(https://npmjs.org/package/forever))

这样你的 ghost 就可以一直运行啦

### 3.3 配置 nginx 使 ghost 可以使用域名访问

安装 nginx 就不多说了，而且你应该早就装好了吧

#### 1) 对于手动安装 nginx 的用户

http://docs.ghost.org/zh/installation/deploy/#配置-ghost-域名

#### 2) 对于lnmp 一键包以及各类面板使用者：

用你的一件包/面板的方法创建一个虚拟机

找到这个虚拟机的 nginx.conf 文件。当然，很可能不叫这个名字，AMH 面板以及军哥 lnmp 似乎都是命名为 your-domain.conf 的。总之找到里面结构类似于

server { listen 80; #listen end server_name your-domain.com; }

这样的就是了。还是找不到请求助于搜索引擎。

找到后，编辑此配置文件为如下：

server { listen 80; server_name example.com; #change it to your domian name location / { proxy_set_header X-Real-IP $remote_addr; proxy_set_header Host $http_host; proxy_pass http://127.0.0.1:2368; } }

原来配置文件中那些乱七八糟的玩意儿删掉也没事


## 四、Ghost 优化

Good Job ! 你已经成功配置好 Ghost 并可以使用域名访问了。可以说 ghost 博客的搭建已经成功了。那么下面就是一些 ghost 博客的优化技巧。

 

<del>To Be Continued. [https://ghost.prinzeugen.net/](http://ghost.prinzeugen.net/)</del>

反正没人看，Ghost 字体微调好麻烦，已弃坑。

[![20150808110252](https://img.blessing.studio/images/2015/08/2015-08-08_03-03-05.jpg)](https://img.blessing.studio/images/2015/08/2015-08-08_03-03-05.jpg)
