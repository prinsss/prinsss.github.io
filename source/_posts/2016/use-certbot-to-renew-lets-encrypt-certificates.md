---
title: "使用 Certbot 更新 Let's Encrypt 证书"
date: '2016-12-10 17:38:31'
updated: '2017-06-11 11:10:15'
categories: 技术
tags:
  - 记录
  - Https
  - "Let's Encrypt"
---

Let's Encrypt 证书即将过期时会给你发送邮件，这个还是比较贴心的。这样也就不会陷入证书过期却没发现的尴尬境地（Let's Encrypt 的证书只有 90 天的有效期）。

![2826714bc9645e4b9828433b8e674800.png](https://img.prin.studio/images/2017/06/11/2826714bc9645e4b9828433b8e674800.png)

以前我写过使用 Certbot 这个工具[申请证书的文章](https://prinzeugen.net/use-certbot-to-issue-lets-encrypt-certificates/)，而同样使用这个工具更新证书只需要一行命令：

```shell
certbot renew --post-hook "service nginx reload"
```

`certbot` 这个脚本的位置呀名称啥的自己看着改，对于我来说是 `./certbot-auto`。加了个钩子可以让它在证书更新更新完毕后重载 Nginx 配置来更新证书。

<!--more-->

![b2134999636066c29c9e93a40bd88a57.png](https://img.prin.studio/images/2017/06/11/b2134999636066c29c9e93a40bd88a57.png)

不想每次都登上去更新的也可以把上面那行脚本加入 crontab（`crontab -e`），让它每个月执行一次：

```
# 这里用绝对路径，保险一点
0 0 1 * * /home/xxx/certbot-auto renew --post-hook "service nginx reload" >/dev/null 2>&1
```

-----------------

P.S. Xshell 管理远程机子比起单纯的终端来还是很方便的，而且最近也对 Home/School 发放免费许可了。

参考链接：[Renewing certificates - Certbot User Guide](https://certbot.eff.org/docs/using.html#renewing-certificates)
