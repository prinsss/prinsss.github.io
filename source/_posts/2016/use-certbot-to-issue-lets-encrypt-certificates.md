---
title: "使用 Certbot 自动签发 Let's Encrypt 证书"
date: '2016-09-19 22:59:17'
updated: '2016-09-19 22:59:17'
categories: 技术
tags:
  - 记录
  - Https
  - "Let's Encrypt"
---

今晚一回来就看到 Google Search Console 给我发了封邮件说我站点上的 SSL 证书过期了。我上去一看还真是，这张我从 Andy 手里买来的通配符证书已经在昨天失效了。

唉，时间也是过得忒快啊，转眼间一年就过去了，我也成为了苦逼的高三党，真是惨得不行 ( ・_ゝ・)

不过正好，我从 [之前就一直在关注](https://prinzeugen.net/lets-encrypt-now-we-are-trusted/) Let's Encrypt 这个项目了，这次正好试试看它好不好用。

<!--more-->

首先先是去查看一下它官网上的文档，毕竟网上那些教程啊啥啥的可能已经过期了，所以还是官方文档靠谱。然后我们可以看到官方的 [Getting Started](https://letsencrypt.org/getting-started/) 里是大力推荐 [Certbot](https://certbot.eff.org/) 这个自动化工具来签发证书的。

我们在 Certbot 的站点上选择好我们的 Web Server 和操作系统版本后，就可以看到详细些的教程了。按照它上面所写的一般就可以正常使用了，如果你看不懂鹰文的话可以去找找其他人写的中文教程。

![screenshot1](https://img.prinzeugen.net/image.php?di=3YNU)

-------------

下面把一些需要注意的地方记录一下：

#### 一、注意 `certonly` 参数

如果不带参数地直接运行 `certbot-auto` 这个脚本的话，它是需要一个 installer 的。如果你懒得折腾这玩意就加上 `certonly` 参数吧，这样脚本就会只会在 `/etc/letsencrypt/live/` 目录下生成对应证书文件了。然后你只需要在你的各站点 Nginx 配置中修改 ssl 证书目录就好了。

#### 二、注意让 Nginx 允许访问 `.well-known` 目录

我安装的 Nginx （OneinStack）默认是不允许访问 `.` 开头的文件和目录的，估计其他 lnmp 包也是这样。然而 ACME 验证你对域名的所有权的方式是通过访问 `http://www.prinzeugen.net/.well-known/acme-challenge/blablabla` 这个 URL 来实现的。所以如果你的 Nginx 不允许访问这个目录的话就 GG 了。

解决方法就是在你的 Nginx 配置里加上这么一段：

```
location /.well-known/acme-challenge/ {
    allow all;
}
```

这个目录下的东西会在验证完毕后被自动删除，所以不必担心安全问题。

#### 三、一次签发多个域名时需要注意的

因为我有好几个域名需要签发 SSL 证书，但是每个域名的 `webroot` 是不一样的，这就可能导致我们需要一条一条这样运行：

```
./certbot-auto certonly --webroot -w /home/wwwroot/prinzeugen.net -d prinzeugen.net
./certbot-auto certonly --webroot -w /home/wwwroot/work.prinzeugen.net -d work.prinzeugen.net
```

或者把所有的 `-w xxx -d xxx` 写在一行里，不过也还是一样的麻烦。这咋行？

还记得我们上面修改过的 Nginx 配置吗？我们来给它做点小手脚：

```
location /.well-known/acme-challenge/ {
    root /home/wwwroot/prinzeugen.net;
    allow all;
}
```

耶！现在我们只需要指定一次 `webroot` 就好啦，因为所有域名的上对于这个文件的请求都会访问到我们所设置的统一的 `root` 里。

现在我们只需要这样写：

```
./certbot-auto certonly --webroot -w /home/wwwroot/prinzeugen.net -d prinzeugen.net -d work.prinzeugen.net
```

就可以一次性签发多个域名的证书啦~ lol

--------------------

![screenshot2](https://img.prinzeugen.net/image.php?di=CI32)

最后，愿你我都能享受到安全的互联网 :)
