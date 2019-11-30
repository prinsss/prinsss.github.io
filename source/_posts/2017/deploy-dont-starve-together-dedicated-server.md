---
title: 饥荒联机版独立服务器搭建踩坑记录
date: 2017-07-15 17:54:24
updated: 2017-07-15 17:54:24
categories: 技术
tags:
  - ACGN
  - Linux

---

最近和几个同学一起联机玩饥荒（Don't Starve Together），虽然饥荒游戏本身就可以直接创建房间让别人加入，但还是有诸多不便驱使我去开一个饥荒的独立服务端（Dedicated Server），其中最主要的就是 ——「**你退了游戏其他人就玩不了了**」。

<!--more-->

本来家里还有一个用旧主板和以前换下的配件攒成的二奶机，安装的是 Elementary OS，确实可以拿来跑饥荒服务器（以前还拿它跑过 MC 服务器），但是不幸的是，由于我直接把主板硬盘之类的一股脑塞在牛奶盒子里放在窗边还不加盖儿，一个雨后的下午，我推开家门后发现那个被我当做机箱的牛奶盒子已经开始积水了……前略，天国的 Pegatron IPX31-GS (・_ゝ・)

直接在主力机上开一个服务器也不是不行，但是我的奔腾 G3258 选手实在是带不动饥荒游戏 + 游戏服务器 + 其他杂七杂八的东西了，所以只好另觅他方，去搞一台 VPS 来开服。而且这里不得不吐槽一下，饥荒联机版独立服务器的配置要求还是比较高的，几个人的小服，再多开几个 Mod，最起码就要 1G 的内存（我那台阿里云宕机好几次，还得去网页控制台强制重启），更不要想开洞穴了。

现在我拿来开服的是免费试用一个月的京东云（Xeon-E5，2G DDR4，1Mbps 的带宽），不开洞穴，目前看起来还是没什么压力的，延迟丢包率什么的也都可以接受。网上关于开服的教程也不少了，这篇文章也不会过多赘述，差不多就是记录一下主要步骤，以及提一下可能会遇到的坑。所以，想要那种很详细的教程的同学还是绕道吧，或者翻到文章最下面的「参考链接」看看。

下面的步骤在 64 位 CentOS 7.3 和 Ubuntu 16.04 上测试通过，至于 Windows……我认为实在没有啥必要特别去写，直接从 Steam 客户端就可以打开，操作方便，也没啥坑，看看网上那些教程就可以了。继续阅读之前，我希望你能有一些 Linux 的操作基础，不然会很懵。

## 0x01 事前准备

首先你要有一台装了 Linux 的服务器，配置要求如下（摘自 [DST Wiki](http://dontstarve.wikia.com/wiki/Don%E2%80%99t_Starve_Together_Dedicated_Servers)）：

- 上行带宽：8KBps 一个玩家；
- 内存：差不多一个玩家 65Mbytes；
- CPU：没太大要求

需要注意的是，饥荒联机版的服务器对内存的要求其实挺大的，亲测只开 Overworld 不开洞穴，空载 RAM 占用约 800MB，再加上差不多 65MB 一个玩家，开 Mod 还会占用更多，所以还是要衡量一下机器的配置。

然后是喜闻乐见的依赖安装环节：

```shell
# Ubuntu/Debian 32 位
$ sudo apt-get -y install libgcc1 libcurl4-gnutls-dev
# Ubuntu/Debian 64 位
$ sudo apt-get -y install lib32gcc1 libcurl4-gnutls-dev:i386
# RedHat/CentOS 32 位
$ sudo yum -y install glibc libstdc++ libcurl4-gnutls-dev
# RedHat/CentOS 64 位
$ sudo yum -y install glibc.i686 libstdc++.i686 libcurl4-gnutls-dev.i686
```

有些源里可能没有 libcurl4-gnutls-dev，那直接安装 `libcurl` 然后做个软链接也是可以的：

```shell
$ cd /usr/lib/
$ ln -s libcurl.so.4 libcurl-gnutls.so.4
```

## 0x02 安装 SteamCMD

SteamCMD，顾名思义，就是 Steam 的命令行版本。虽然饥荒服务器本身并不需要用 Steam 进行验证啊之类的，但我们还是得用它来把服务器更新到最新版本，不然其他人是进不来的。

我们最好新建一个用户来运行 SteamCMD，如果直接用 root 用户运行游戏服务端的话可能会导致严重的安全隐患。在 root 权限下使用以下命令来创建一个新用户：

```shell
$ useradd -m steam
$ su - steam
```

然后在你喜欢的地方创建一个为 SteamCMD 准备的目录：

```shell
$ mkdir ~/steamcmd && cd ~/steamcmd
```

下载并解压 Linux 专用的 SteamCMD：

```shell
$ wget https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz
$ tar -xvzf steamcmd_linux.tar.gz
```

运行 SteamCMD：

```shell
$ ./steamcmd.sh
```

登录安装退出一气呵成：

```
# 匿名登录，没必要用用户名密码登录
login anonymous
# 这里我们强制要 Steam 把饥荒服务端安装到此目录下
# 最好用绝对路径，否则可能会安装到奇怪的地方去
force_install_dir /home/steam/dstserver
app_update 343050 validate
quit
```

![SteamCMD 截图](https://i.loli.net/2017/07/15/596a251199343.png)

等进度跑完，饥荒服务端就已经安装在指定位置了：

![dstserver 截图](https://img.blessing.studio/images/2017/07/15/snipaste_20170715_222348.png)

另外，SteamCMD 也是可以用 apt、yum 之类的包管理器来安装的，如果你的源里有的话（阿里云的镜像源里是有的，Debian 的话还得在源里加上 non-free area）。直接用包管理器安装的话 SteamCMD 可执行文件是安装到 `/usr/games` 目录下的，可以软链接到方便的地方去：

```shell
$ ln -s /usr/games/steamcmd ~/steamcmd
```

用法和上面的 `steamcmd.sh` 是一样的。

## 0x03 运行饥荒服务端

如果上面 SteamCMD 里没有用 `force_install_dir` 强制指定安装目录的话，服务端默认是安装到 `~/Steam/steamapps/common/Don't Starve Together Dedicated Server` 目录下的。我们先进去运行一下服务端，确保依赖之类的配置正确：

```shell
$ cd ~/dstserver/bin
$ ./dontstarve_dedicated_server_nullrenderer
```

有可能会报这样的错：

```
error while loading shared libraries: libcurl-gnutls.so.4: cannot open shared object file: No such file or directory
```

这说明你 libcurl-gnutls 依赖没安装或者没配置好，可参照上面的「事前准备」安装依赖。

注意，**千万不要** 在其他目录下使用类似 `./bin/dontstarve_dedicated_server_nullrenderer` 的命令来运行服务端，否则你会得到类似这样的找不到 `scripts/main.lua` 文件的报错信息：

```
[00:00:00]: Starting Up
...
[00:00:00]: DoLuaFile scripts/main.lua
[00:00:00]: DoLuaFile Could not load lua file scripts/main.lua
[00:00:00]: Error loading main.lua
...
[00:00:00]: Shutting down
```

我估计是相对路径的锅，害我在这个报错上疯狂找资料卡了半小时，说不出话。

另外注意开放 VPS 的 10999 端口（或者你的自定义端口）的 UDP 访问（iptables、firewalld、主机商的防火墙 etc.）。接下来的服务器配置之类的我就不多说了。

如果以后要升级服务端的话，直接再重复一遍上面 SteamCMD 安装的步骤就可以了，也可以直接一句话解决：

```shell
$ ./steamcmd.sh +login anonymous +force_install_dir ~/dst +app_update 343050 validate +quit
```

## 0x04 服务端配置
<style>.post-content table, .post-content code { word-wrap: break-word; }</style>
虽然我们上面直接运行了 `dontstarve_dedicated_server_nullrenderer`，但是这个程序还是有其他的启动参数的。主要参数如下：

| 参数                       | 用法                                       |
| ------------------------ | ---------------------------------------- |
| -persistent_storage_root | 指定存档根目录的位置，必须是绝对目录。默认为 `~/.klei`。        |
| -conf_dir                | 指定配置文件的目录名。默认为 `DoNotStarveTogether`，和上一个参数拼在一起就是你存档的完整位置了，默认为 `~/.klei/DoNotStarveTogether`，所有的存档都在这里。 |
| -cluster                 | 指定启动的世界，默认为 `Cluster_1`。服务端启动时会去找 `<persistent_storage_root>/<conf_dir>/<cluster>` 目录下的 `cluster.ini` 这个配置文件，你的世界名称、密码、游戏模式之类的都是在这里配置的（网上有些教程里用的 `setting.ini`，那个是旧版的）。同理，你的存档文件夹也可以不使用类似 `Cluster_X` 的名字，改成其他什么乱七八糟的都可以，只要启动时指定本参数就行了。 |
| -shard                   | 默认为 `Master`，启动时将此参数指定为 `Cave` 就可以启动洞穴服务器。 |

其他的参数我就不一一说明了，具体的参数列表可以在[这里](http://forums.kleientertainment.com/topic/64743-dedicated-server-command-line-options-guide/)查看。举个栗子：

```shell
# 同时启动主世界服务器和洞穴服务器
$ ./dontstarve_dedicated_server_nullrenderer -console -cluster MyClusterName -shard Master
$ ./dontstarve_dedicated_server_nullrenderer -console -cluster MyClusterName -shard Caves
```

游戏服务端会读取这些文件中的配置：

```
# 如果你用了 -persistent_storage_root 和 -conf_dir 指定了另外的目录
# 那游戏就会去 <persistent_storage_root>/<conf_dir>/<cluster> 下查找这些文件
# 如果没指定，默认如下：
~/.klei/DoNotStarveTogether/MyClusterName/cluster.ini
~/.klei/DoNotStarveTogether/MyClusterName/Master/server.ini
~/.klei/DoNotStarveTogether/MyClusterName/Caves/server.ini
```

至于如何在 `cluster_token.txt` 中填入你的 Token，以及 `cluster.ini` 和 `server.ini` 的内容之类的，我这里也不多说，具体可参照下面的「参考链接」。

## 0x05 Mod 安装

给饥荒联机版服务器添加 Mod 主要分两步。

**第一步**，让服务器知道我们要用到什么，这样游戏运行时就会自动帮我们下载并安装这些 Mod（如果没有下载的话），并更新到最新版本。首先进入你服务器安装目录下的 `mods` 文件夹：

```shell
$ cd /home/steam/dstserver/mods
```

打开 `dedicated_server_mods_setup.lua` 文件，添加如下内容：

```
ServerModSetup("758532836")
```

其中那一串数字就是 Mod 在 Steam 创意工坊里的 ID（地址栏上就有），至于怎么获取，就看你的了。注意，每一个 Mod 都要用这样的格式在该文件中添加一行，所以最后添加完毕的画风应该是这样的：

![Mod List](https://i.loli.net/2017/07/16/596b0d54cc5ed.png)

从这个文件的注释里你也能知道（如果你看得懂洋文的话），我们还可以直接在这个文件中使用类似 `ServerModCollectionSetup("ID")` 的格式来订阅合集中的所有 Mod，方便不少。

**第二步**，启用 Mod。安装 Mod 之后，我们还需要配置一下每个存档对应要启用什么 Mod。

```shell
# 如果你用启动参数把存档位置改到其他位置的话，就进去你自定义存档位置下的 Master 目录
$ cd ~/.klei/DoNotStarveTogether/Cluster_1/Master
```

然后编辑 `modoverrides.lua` 文件，填入以下内容：

```lua
return {
  ["workshop-797304209"]={ configuration_options={  }, enabled=true },
  ["workshop-806984122"]={ configuration_options={  }, enabled=true },
  ["workshop-758532836"]={
    configuration_options={
      AUTOPAUSECONSOLE=false,
      AUTOPAUSEMAP=false,
      AUTOPAUSESINGLEPLAYERONLY=true,
      ENABLECLIENTPAUSE=false,
      ENABLEHOTKEY=false,
      KEYBOARDTOGGLEKEY="P"
    },
    enabled=true
  }
}
```

如果你懂一点 Lua 语法的话修改起来会比较得心应手。其中 `["workshop-758532836"]` 就是 ID 为 `758532836` 的 Mod，`enabled=true` 表示启用该 Mod，`configuration_options = {}` 里的就是 Mod 的配置，具体可以去 Mod 的 `modinfo.lua` 文件里查阅。

但是，这是一个很麻烦的过程，所以我们可以用一些取巧的办法完成 Mod 的配置。

![可视化配置](https://i.loli.net/2017/07/16/596b1269ce00a.png)

首先我们去 Steam 客户端里打开饥荒联机版的游戏，然后创建一个世界，把那些「你想要在服务器里启用的 Mod」都给启用了，并且直接在游戏的「Mod 配置」页面里配置好（有可视化界面，配置很方便），配置完毕后进入世界再退掉。这时候进去你的存档位置（比如：`Documents\Klei\DoNotStarveTogether\Cluster_3\Master`），把你本地的 `modoverrides.lua` 文件内容上传到服务器里就好了。

不然直接在文件里配置真的很痛苦，真的。

## 0x06 存档迁移

另开新档的可以不用看了，这节主要是讲怎样把电脑 Steam 客户端里的饥荒联机版存档放到服务器里跑。

饥荒客户端的存档位置如下：

```
# Windows
Documents\Klei\DoNotStarveTogether
# Linux
~/.klei/DoNotStarveTogether
# MacOS
~/Documents/Klei/DoNotStarveTogether
```

接下来需要注意的是，你直接在饥荒联机版客户端里开的世界，如果没有开洞穴的话，存档是在 `client_save` 目录下的；只有当你开启了洞穴时，世界存档才会在 `Cluster_X` 目录下（X 就是世界在游戏中「创建世界」里对应的位置）。曾经我就因为备份错目录，当后来被删档想要回档时，发现以前备份的都是无效文件。我相信你不会想要碰到这种情况的🌚

![存档](https://img.blessing.studio/images/2017/07/16/snipaste_20170716_140614.png)

那么 `Cluster_X` 里的内容和 `client_save` 里的有啥不一样呢？其实只要观察一下就能发现 `client_save` 里的目录结构是和 `Cluster_X/Master/save` 目录是一样的。如果你原来客户端里的存档就是开了洞穴的，那么直接把对应 `Cluster_X` 里的内容上传到服务端对应的目录下就 OK 了。如果不是，那也不会很麻烦：

首先，你可以先运行一下饥荒服务端，这样服务端就会自动帮你生成一个完整的存档目录（目录结构什么的都是完整的，就不用你自己去一个一个新建了），然后把 `client_save` 里的文件一股脑上传至 `YourClusterName/Master/save` 里面去就好了。

如果你想要自己建立存档目录，那么主要需要建立这几个目录及文件：

```shell
$ tree
.
├── Caves # 如果你想要开洞穴的话
│   └── server.ini
├── cluster.ini
├── cluster_token.txt
└── Master
    ├── modoverrides.lua
    └── server.ini
```

配置文件的内容可参考饥荒论坛的文档或下方「参考链接」。

## 0x07 参考链接

- [从 steam 客户端建房 到 linux 建立服务器](http://steamcommunity.com/sharedfiles/filedetails/?id=687261496)
- [DST Dedicated Server 服务器配置教程](http://steamcommunity.com/sharedfiles/filedetails/?id=382584094) 👈这篇的内容有些过期了
- [Don’t Starve Together（饥荒）服务器搭建](https://www.nevermoe.com/?p=695)
- [Guides/Don’t Starve Together Dedicated Servers](http://dontstarve.wikia.com/wiki/Don%E2%80%99t_Starve_Together_Dedicated_Servers) 👈DST Wiki
- [Install Don't Starve Together Game Server on Ubuntu 14.04](https://www.linode.com/docs/game-servers/install-dont-starve-together-game-server-on-ubuntu)
- [How to setup dedicated server with cave on Linux](http://steamcommunity.com/sharedfiles/filedetails/?id=590565473) 👈洋文，很详尽，推荐
- [饥荒联机独立服务器搭建教程（三）：配置篇](http://blog.ttionya.com/article-1235.html) 👈不知道配置文件怎么填的看这个
- [Dedicated Server Command Line Options Guide](http://forums.kleientertainment.com/topic/64743-dedicated-server-command-line-options-guide/)

![小偷背包](https://img.blessing.studio/images/2017/07/16/QQ20170714161422.png)

最后，祝诸君游戏愉快 ;)

