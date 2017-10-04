---
title: '使用 nginx rewrite 实现域名自动跳转'
date: '2015-07-26 20:40:13'
updated: '2015-08-29 00:35:53'
categories: 技术
tags:
  - Nginx
---

咱是全站 ssl 加密的，自然不能让访客以 http 协议明文访问。要实现 http 访问自动重定向至 https，可以使用 nginx 的 rewrite 语句。

虽然咱是早就实现了，但是最近由于种种原因重新配置时又要再去搜索，遂写篇文章备忘。

**http 跳转到 https：**

rewrite ^(.*)$  https://$host$1 permanent;

**带 www 域名跳转到根域名：**

if ($host ~* www.prinzeugen.net) { rewrite ^/(.*)$ https://prinzeugen.net/$1 permanent; }

顺带一提如果需要这几句话的地方比较多，可以写个 conf 直接 include，举个栗子：

在 rewrite.conf 中写上上面的语句，然后在 **nginx.conf** 中写一句：

include /home/wwwroot/lnmp/rewrite.conf;

就可以了。BTW，如果是 amh 面板用户，在 amhrewrite 模块中加入上面的语句就好了。



