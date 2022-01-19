---
title: 'Windows 下手动搭建 PHP + Nginx/Apache 开发环境'
date: '2018-11-01 23:00:10'
updated: '2020-03-03 21:37:00'
categories: 技术
tags:
  - PHP
  - Nginx
  - Apache
---

看到这个标题，有人可能会想吐槽：

**你他娘的写了这么久 PHP，怎么现在想起来搭建开发环境了？**

呃，情况呢是这么个情况，我之前开发的那个 PHP 项目 ([blessing-skin-server](https://github.com/prinsss/blessing-skin-server/)) 在两个月前发布 v3.5.0 版本后基本就已经告一段落了。虽然我本意是不再更新~~（弃坑的委婉说法）~~，因为当前的版本已经足够完善，该有的东西都有了（而且说实话搞了这么久我也腻味，不仅是对这个程序，还有对国内 Minecraft 开发生态以及用户群体的失望）。

不过我的朋友 [g-plane](https://blog.gplane.win/) 说他愿意接坑，所以现在这个项目的后续开发都是他在搞。而我也乐得清闲，做个甩手掌柜 [搞别的](https://prinsss.github.io/vscode-c-cpp-configuration-for-acm-oj/) 去了。当我摸鱼正快活时，他过来联系我说准备发布 4.0.0-alpha 了，我才想起来这茬：「啊，我连新版本长啥样都还不知道呢！😂」于是急急忙忙 pull 了新代码准备 review 一下，却发现我的新笔电上甚至压根儿就没安装 PHP 开发环境，只能说是非常地真实。

<!--more-->

因为 [某些原因](https://prinsss.github.io/phpstudy-prober-page-502-bad-gateway/)，我不想继续使用那些 PHP 一键包来搭建开发环境了，所以这次我打算全部自己来。本文记录了我手动安装配置 PHP + Nginx/Apache 开发环境的过程，希望能帮到后来人。

注意，本文中的配置适用于本地开发环境，应用至生产环境时要注意哦。

> **2020/03/03 更新**：
>
> 你也可以直接用 scoop 来管理 WNMP 开发环境。
>
> 安装：
>
> ```cmd
> scoop install nginx mariadb php
> ```
>
> 启动：
>
> ```cmd
> nginx -p %NGINX_HOME%
> mysqld --standalone
> php-cgi -b 127.0.0.1:9000
> ```
>
> 配置或数据文件的位置：
>
> ```text
> C:\Users\prin\scoop\apps\nginx\current\conf
> C:\Users\prin\scoop\apps\mariadb\current\data
> C:\Users\prin\scoop\apps\php\current\cli
> ```
>
> 比起手动下载方便不少。

## 0x01 安装 Nginx / Apache

**如果你用的是 Nginx：**

- 去 [官网](https://nginx.org/en/download.html) 下载 Windows 版的 Nginx（我下载的是 `nginx-1.14.0.zip`）；
- 解压至你喜欢的地方（我放在 `E:\environment\nginx` 里）；
- 直接双击运行 `nginx.exe`；
- 如果能正常访问 `http://localhost:80`，就可以进行下一步了。

推荐修改的 `nginx.conf` 配置如下：

```nginx
# 可以适当调高，但不要超过 CPU 核心数量
worker_processes  4;

events {
    # 开发环境下不用太考虑 worker 最大并发连接数
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile      on;
    keepalive_timeout 65;

    # 启用 gzip
    gzip on;
    gzip_disable "MSIE [1-6].(?!.*SV1)";
    gzip_http_version 1.1;
    gzip_vary on;
    gzip_proxied any;
    gzip_min_length 1000;
    gzip_buffers 16 8k;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/x-javascript application/xml application/xml+rss;

    # 这里面的内容等 0x03 再细说
    include vhosts.conf;
}
```

**如果你用的是 Apache：**

- 因为 Apache 官网并不提供 Windows 版的构建下载，所以需要去 [Apache Lounge](https://www.apachelounge.com/download/) 或者其他 [官方推荐的站点](https://httpd.apache.org/docs/current/platform/windows.html#down) 下载预编译二进制包（我下载的是 `httpd-2.4.37-win64-VC15.zip`，你愿意的话也可以自己编译）；
- 解压至你喜欢的地方（我放在 `E:\environment\apache` 里）；
- 直接双击运行 `bin/httpd.exe`；
- 如果能正常访问 `http://localhost:80`，就可以进行下一步了。

推荐修改的 `httpd.conf` 配置如下：

```apache
# 修改为你的安装目录
Define SRVROOT "E:\environment\apache"
ServerRoot "${SRVROOT}"

Listen 80
ServerName localhost

# 按需启用模块
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule ...

# 推荐注释掉自带的 DocumentRoot 和 <Directory>
# 这里面的内容等 0x03 再细说
Include conf/extra/httpd-php.conf
Include conf/vhosts.conf
```

## 0x02 安装 PHP

Windows 版 PHP 下载地址：

https://windows.php.net/download

其中有 NTS（Non Thread Safe，非线程安全）和 TS（Thread Safe，线程安全）两种版本，简单来说就是 **Nginx 用 NTS 版，Apache 通常用 TS 版**（也可以用 NTS），它们之间的具体区别有兴趣的话可以自己去了解一下。

为了同时兼容 Nginx 与 Apache，本文将以 NTS 版为例进行配置。

- 下载合适的版本（我下载的是 `php-7.2.11-nts-Win32-VC15-x64.zip`）；
- 解压至你喜欢的位置（我放在 `E:\environment\php` 里）；
- 复制一份 `php.ini-development`，重命名为 `php.ini` 并适当修改其中配置；
- 直接双击运行 `php.exe`；
- 如果能正常打开 PHP Interactive Shell，就可以进入下一步了。

**如果无法运行，请检查你是否安装了对应的 VC 运行库。**

推荐修改的 `php.ini` 配置如下：

```ini
; 扩展所在的目录，自行修改
extension_dir = "E:\environment\php\ext"
; 按自己的需求启用扩展
extension=pdo_mysql
extension=...
; 各种缓存的位置
sys_temp_dir = "E:\environment\php\temp"
upload_tmp_dir = "E:\environment\php\temp"
session.save_path = "E:\environment\php\temp"
; 其他杂七杂八的
upload_max_filesize = 100M
date.timezone = Asia/Shanghai
```

## 0x03 配置 FastCGI 转发

接下来才是重头戏，我们要让 Web Server 与 PHP 能够互相通信以完成请求。

作为 Web Server 的后端时，PHP 主要有两种运行方式，一种是 **独立进程、使用 [FastCGI 协议](http://www.nowamagic.net/librarys/veda/detail/1319) 与 Web Server 通信**（Nginx 用的就是这种），另外一种是 **作为模块直接加载到 Web Server 中**（比如 Apache 的 `mod_php` 模块，不过 Apache 也支持 FastCGI 方式）。详细的原理我就不介绍了，有兴趣的选手可以去了解一下。

为了能够同时兼容 Nginx 和 Apache，**本文均使用 FastCGI 方式加载 PHP**。

-----

首先我们需要配置一下 PHP 的 FastCGI 进程管理器。为什么呢？因为直接运行 PHP 的 FastCGI 进程（在 Windows 上就是 `php-cgi.exe`）有以下缺点：

- 配置文件 `php.ini` 修改后无法平滑重载，需要重新启动 `php-cgi` 进程；
- Windows 下 `php-cgi` 默认处理 500 个请求后就自动退出（`PHP_FCGI_MAX_REQUESTS`）；
- 如果因为其他原因造成 `php-cgi` 进程崩溃，就无法处理后续请求了。

所以我们需要一个类似守护进程的东西，来保证始终有一定数量的 `php-cgi` 进程在运行。[PHP-FPM](http://php.net/manual/zh/install.fpm.php) (PHP FastCGI Process Manager) 是 PHP 官方钦定的 FastCGI 进程管理器，但遗憾的是，它只适用于类 Unix 系统。在 Windows 上，我们可以使用这些替代品来实现类似的功能（**Apache 用户不需要配置这些东西**，因为它的 `mod_fcgid` 模块自带 FastCGI 进程管理功能）：

- [xxfpm](https://github.com/78/xxfpm)
- [php-cgi-spawner](https://github.com/deemru/php-cgi-spawner)
- [spawn-fcgi](https://github.com/lighttpd/spawn-fcgi)

本文将以 php-cgi-spawner 为例进行配置。

- 在 [这里](https://github.com/deemru/php-cgi-spawner/releases) 下载编译好的 `php-cgi-spawner.exe`；

- 放到 PHP 的安装目录下（本文为 `E:\environment\php`）；

- 打开 PowerShell 或者 CMD，运行命令：
  ```powershell
  # 令 PHP FastCGI 处理程序监听在 9000 端口上
  # 至少开启 4 个 php-cgi 进程，高负载时最多可以开到 16 个
  .\php-cgi-spawner.exe "php-cgi.exe -c php.ini" 9000 4+16
  ```

- 如果一切正常，你将可以在任务管理器中看到同时运行的多个 `php-cgi` 进程。

![php-cgi-processes](https://img.prin.studio/images/2018/11/01/php-cgi-processes.png)

**接下来修改 Nginx 配置**（即 0x01 中提到的 `vhosts.conf` 中的内容），通过 FastCGI 协议将请求转发给监听在 9000 端口上的 PHP 进行处理：

```nginx
server {
    listen       80;
    server_name  localhost;
    root   E:/wwwroot;
    index  index.html index.htm index.php;

    location ~ [^/]\.php(/|$) {
        # 从 URI 中分离出 $fastcgi_script_name 和 $fastcgi_path_info 的值
        # 不推荐使用 php.ini 中的 cgi.fix_pathinfo 选项，这可能会造成安全隐患
        # 虽然我感觉 8012 年了应该没人用 PATH_INFO 了……不需要的话去掉即可
        fastcgi_split_path_info  ^(.+?\.php)(/.*)$;
        fastcgi_param  PATH_INFO  $fastcgi_path_info;

        # 当请求的 .php 文件不存在时直接返回 404
        # 不然交给 PHP 处理的话那边就会返回 No input file specified.
        if (!-f $document_root$fastcgi_script_name) {
            return 404;
        }

        fastcgi_pass   127.0.0.1:9000;
        fastcgi_index  index.php;
        # 自带的配置文件，里面设置了一大堆 CGI 协议中的变量
        include        fastcgi.conf;
    }
}
```

-----

**Apache 用户不需要手动配置 PHP FastCGI 进程管理器，相对简单一些：**

- 在上面提到的 [Apache Lounge](https://www.apachelounge.com/download/) 上下载编译好的 `mod_fcgid` 模块；
- 解压后，将 `mod_fcgid.so` 放入 Apache 的 `modules` 目录；
- 编辑配置文件加载模块（即 0x01 中提到的 `conf/extra/httpd-php.conf`）：

```apache
# 如果嫌麻烦的话这一段也可以直接放到 httpd.conf 里面去
LoadModule fcgid_module modules/mod_fcgid.so

<IfModule fcgid_module>
FcgidInitialEnv PHPRC "E:/environment/php/"
FcgidInitialEnv PHP_FCGI_MAX_REQUESTS 1000
AddHandler fcgid-script .php
FcgidWrapper "E:/environment/php/php-cgi.exe" .php
FcgidIOTimeout 384
FcgidConnectTimeout 360
FcgidOutputBufferSize 128
FcgidMaxRequestsPerProcess 1000
FcgidMinProcessesPerClass 0
FcgidMaxProcesses 16
FcgidMaxRequestLen 268435456
ProcessLifeTime 360
</IfModule>
```

- 编辑 `conf/vhosts.conf` 允许运行 CGI 程序：

```apache
<VirtualHost localhost:80>
  DocumentRoot "E:\wwwroot"
  <Directory "E:\wwwroot">
    DirectoryIndex index.html index.php
    # 注意这里的 +ExecCGI，不加的话会 403
    Options -Indexes -FollowSymLinks +ExecCGI
    AllowOverride All
    Order allow,deny
    Allow from all
    Require all granted
  </Directory>
</VirtualHost>
```

如果一切配置正确，你应该就能正常访问 PHP 网页了。

![nginx-php-works](https://img.prin.studio/images/2018/11/01/nginx-php-works.png)

## 0x04 编写启停脚本

虽然整个系统是跑起来了，但总不能每次启动都得开一大堆控制台窗口吧？弄个小工具管理 Nginx/Apache 和 PHP 的进程还是很有必要的。各种一键包中一般都自带了方便好用的界面来管理这些进程，不过既然我们选择了手动配置，那这一块也得我们自己搞定了。因为图方便，我选择使用 Windows 的批处理脚本（Batch File）来完成这项需求，保存为 `.bat` 文件双击运行就完事儿了。

**启动 Nginx 和 PHP：**

```cmd
@ECHO OFF
set nginx_home=..\nginx
set php_home=..\php

ECHO Starting PHP FastCGI...
.\RunHiddenConsole.exe %php_home%\php-cgi-spawner.exe "%php_home%\php-cgi.exe -c %php_home%\php.ini" 9000 4+16

ECHO Starting Nginx...
.\RunHiddenConsole.exe %nginx_home%\nginx.exe -p %nginx_home%
```

**停止 Nginx 和 PHP：**

```cmd
@ECHO OFF

ECHO Stopping nginx...
taskkill /F /IM nginx.exe > nul

ECHO Stopping PHP FastCGI...
taskkill /F /IM php-cgi-spawner.exe > nul
taskkill /F /IM php-cgi.exe > nul
```

**重载 Nginx 配置：**

```cmd
@ECHO OFF
set nginx_home=..\nginx

ECHO Reloading Nginx...
%nginx_home%\nginx.exe -s reload
```

**启动 Apache**（Apache 会帮我们启动 PHP 的）：

```cmd
@ECHO OFF
set apache_home=..\apache

ECHO Starting Apache Httpd...
.\RunHiddenConsole.exe %apache_home%\bin\httpd.exe
```

**停止 Apache：**

```cmd
@ECHO OFF

ECHO Stopping Apache Httpd...
taskkill /F /IM httpd.exe > nul
```

这些脚本我放在 `E:\environment\scripts` 目录中，如果你需要放在其他地方，请适当修改脚本中的可执行文件路径。另外，脚本中用到了 `RunHiddenConsole.exe` 来隐藏命令行窗口，你可以在 [这里](http://redmine.lighttpd.net/attachments/660/RunHiddenConsole.zip) 下载到这个小工具。

![wnmp-all-processes](https://img.prin.studio/images/2018/11/01/wnmp-all-processes.png)

## 0x05 后记

配置完成后的目录结构大概是这样的（有省略）：

```text
E:\environment> tree
.
├── apache
│   ├── bin
│   ├── cgi-bin
│   ├── conf
│   │   ├── extra
│   │   ├── original
│   │   ├── charset.conv
│   │   ├── httpd.conf *
│   │   ├── magic
│   │   ├── mime.types
│   │   ├── openssl.cnf
│   │   └── vhosts.conf *
│   ├── include
│   ├── lib
│   ├── logs
│   └── modules
├── mysql
│   ├── bin
│   ├── data
│   ├── include
│   ├── lib
│   └── share
├── nginx
│   ├── conf
│   │   ├── fastcgi.conf
│   │   ├── fastcgi_params
│   │   ├── koi-utf
│   │   ├── koi-win
│   │   ├── mime.types
│   │   ├── nginx.conf *
│   │   ├── scgi_params
│   │   ├── uwsgi_params
│   │   ├── vhosts.conf *
│   │   └── win-utf
│   ├── contrib
│   ├── logs
│   └── nginx.exe
├── php
│   ├── dev
│   ├── ext
│   ├── extras
│   ├── lib
│   ├── sasl2
│   ├── temp
│   ├── ...
│   ├── php7.dll
│   ├── php-cgi.exe
│   ├── php-cgi-spawner.exe *
│   ├── php.exe
│   └── php.ini *
└── scripts
    ├── reload-nginx.bat
    ├── restart-nginx.bat
    ├── RunHiddenConsole.exe
    ├── start-all.bat
    ├── start-apache.bat
    ├── start-mysql.bat
    ├── start-nginx.bat
    ├── stop-all.bat
    ├── stop-apache.bat
    ├── stop-mysql.bat
    └── stop-nginx.bat
```

非常清爽，有种一切尽在掌控中的感觉，我喜欢。

如果你是一名 PHP 开发者，却从来没有手动配置过 PHP 环境的话，那我建议你尝试一下。虽然生产环境上一般都是采用成熟的一键包，不过手动配置一下这一套东西可以更深入地了解 PHP 与 Web Server 的协作机制，这对于编写上层应用以及运维也是很有好处的。

本来想顺带凑齐一套 WNMP，但是 MySQL 的安装配置相对比较简单，而且也不像 PHP 与 Web Server 那样耦合紧密，所以这里就按下不表。
