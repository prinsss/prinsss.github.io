---
title: '撸了一个 Google Analytics 的反代'
date: '2015-08-31 18:14:34'
updated: '2015-10-26 05:41:26'
categories: 日常
tags:
  - 折腾
  - 记录
---

{% alert warning %}
没什么用，可以不用看了，不要浪费你宝贵的生命。仅为记录这次折腾。
{% endalert %}

{% alert success %}
**Upadte:** 已找到 Google Analytics 的统计信息 POST [协议](https://developers.google.com/analytics/devguides/collection/protocol/v1/reference)，等有时间会把统计搬到后端去，敬请期待。~~咕咕咕~~
{% endalert %}

~~虽然 Google Analytics 已经没有被墙了，但是访问速度时好时坏，实在是不敢恭维：~~

[![fucking speed](https://img.blessing.studio/images/2015/08/2015-08-31_01-15-27.png)](https://img.blessing.studio/images/2015/08/2015-08-31_01-15-27.png)

~~但是对于那些国内统计又无感，所以搭建了一个 GA 的 [反代](https://ga.prinzeugen.net/) 给自己用。~~

~~在追踪代码里把域名替换一下就好了。所幸 GA 没有什么坑爹的验证机制。。~~

~~[![GA](https://img.blessing.studio/images/2015/08/2015-08-31_01-22-15-1024x284.png)](https://img.blessing.studio/images/2015/08/2015-08-31_01-22-15.png)~~

{% alert danger %}
**但是！** 使用反代的追踪代码会导致你失去访客的 IP 地址！虽然其他信息譬如语言，分辨率还是保留的。所以并没有什么琴梨用 (´∀((☆ミつ。`X-Real-IP $remote_addr` 之类的也没用，正在找解决方法。想要用就用吧。
{% endalert %}

下面的内容是给那些做反向代理但是想要替换首页的人准备的：

记录一下窝踩的坑，希望能帮到其他人。

<!--more-->

如果你想要反代一些静态资源网站譬如 `fonts.gstatic.com`，而且只想反代类似于 `fonts.prinzeugen.net/example.woff` 的资源文件，而访问 `fonts.prinzeugen.net` 是自己的页面，那么要怎么做呢？

窝在网上也找了好久，关键词 `nginx 反向代理 替换首页`， `nginx reverse proxy homepage` 之类的，均无果。不知道是没有人写出来呢，还是窝搜索的姿势不对 qwq。

后来想起 nginx.conf 里的 location 似乎可以指定 `location /` （即访问首页）时不反代，`location ~* \.(eot|ttf|woff|woff2)$` 的时候（即请求字体文件时）反代。于是仔细看了看 nginx 的[文档](http://nginx.org/en/docs/http/ngx_http_core_module.html#location)，找到如下解决方法：

```nginx
location / {
    # Nothing here to access index
}
location ~* \.(eot|ttf|woff|woff2)$ {
    # reverse proxy config
    default_type text/html;
    subs_filter_types text/css text/xml; # subs_filtert end

    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Referer http://fonts.gstatic.com; # header_referer end
    proxy_set_header Host fonts.gstatic.com; # header_host end
    proxy_pass http://fonts.gstatic.com; # proxy_pass end
    proxy_set_header Accept-Encoding "";
}
```

高亮行已经标出。总之思路就是这样~ 如果你想反代 Google Analytics 的话就像这样写：

```
location / {
    # Nothing here to access index
}
location /analytics.js {
    default_type text/html;

    subs_filter_types text/css text/xml text/javascript; #subs_filtert end
    subs_filter 'www.google-analytics.com' 'ga.prinzeugen.net' g;

    echo_after_body 'console.log("This website uses Reverse Proxy service of Google Analytics by Blessing Studio: https://ga.prinzeugen.net");';

    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Referer https://www.google-analytics.com; #header_referer end
    proxy_set_header Host www.google-analytics.com; #header_host end
    proxy_pass https://www.google-analytics.com; #proxy_pass end
    proxy_set_header Accept-Encoding "";
}
location /r/ {
    # Reverse Proxy Config Here
}
location /collect {
    # Reverse Proxy Config Here
}
```

 

 
