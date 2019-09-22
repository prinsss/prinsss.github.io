---
title: 'nginx 二级目录不加入 / 无法访问的解决方法'
date: '2015-07-17 06:16:17'
updated: '2016-04-11 21:44:46'
categories: 技术
tags:
  - Nginx
---

今天咱重新在 vps 上部署贴吧云签到的时候，发现：

https://prinzeugen.net/cloudsign 无法访问，直接跳转到根域名首页去了

加入 `/` 即：[https://prinzeugen.net/cloudsign/](https://prinzeugen.net/cloudsign/) 就可以访问了

但这样也太 tm 坑爹了吧 [![20150715224933](https://img.blessing.studio/images/2015/07/2015-07-15_14-49-46.jpg)](https://img.blessing.studio/images/2015/07/2015-07-15_14-49-46.jpg) ，遂查找到解决方法如下：

常见做法：在 rewrite 规则中加入

```nginx
if (-d $request_filename) { 
    rewrite ^/(.*)([^/])$ http://$host/$1$2/ permanent; 
}
```

更佳的替代方法：修改 ngnix.conf 中

```
optimize_server_names off; ＃优化服务器名称：关 
server_name_in_redirect off; ＃服务器名称重定向：关
```

