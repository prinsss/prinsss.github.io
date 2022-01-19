---
title: '使用 Nginx 反代并缓存动态内容'
date: '2016-10-04 10:15:00'
updated: '2016-10-04 11:41:06'
categories: 技术
tags:
  - 运维
  - Nginx
---

因为着实没想到一个皮肤站竟然会有这么大的并发（好吧其实也不大，QPS 大概 50 左右），所以我之前 开发/部署 Blessing Skin Server 的时候是完全没考虑到缓存优化的。直到后来出现了 [神秘的高并发](https://prinzeugen.net/have-been-ddos-and-cc-attacked/)（QPS 上 200）导致皮肤站宕机我才意识到缓存的重要性。

我到现在也还是搞不懂那到底是正常流量还是 CC 攻击。。难道正常用户会每秒请求 20+ 次 Json Profile 吗？又不是天天退/进游戏玩 ![emotion](https://moepic.org/images/2016/10/02/c066215f622f0bf2fe7ee9625955e343.jpg)

虽然当时我就花了一点时间给 Json Profile 和皮肤预览之类的地方 [加上了缓存](https://prinzeugen.net/use-observer-pattern-of-laravel-to-implement-loosely-coupled-cache/)，但是由于这些缓存方案都是在 Laravel 层之上的，所以框架的性能依旧是硬伤。试了下 [Stone](https://github.com/StoneGroup/stone)
之类的优化措施也没什么卵效果，再加上我学业也忙了起来，这个问题就被搁置了。

正好最近国庆放假（虽然只有四天），我就抽了点时间出来研究了一下如何给我的皮肤站套一层缓存 ( ・_ゝ・)

<!--more-->
------------

网上关于页面缓存的解决方案大致有 `Squid`、`Varnish`、`Nginx` 几种，他们之间各有优劣，有兴趣的可以自行搜索。我因为需求不大所以就选用了 Nginx 来缓存动态内容。

虽然说 Nginx 同时还可以做到负载均衡之类的事，但由于我这穷屌只有一台机子，所以只好普通地做成这样的架构：

```
[用户] --- 访问 ---> [skin.prinzeugen.net]
  ^                           |
  |                           v
  |--- 返回缓存 <-（否）-缓存是否过期？
  |                           |
  |                           v
  |-------返回-------（是，重新请求并缓存）
                          |          ^
                      请求|          |响应
                          v          |
                        [localhost:8080]
```

这样的话，虽然还是 Layer7 的缓存处理，但是由于绕过了坑爹的 Laravel，站点的性能还是可以有大幅提高的。

具体如何配置 Nginx 的缓存，可以参考以下的链接，我就不多赘述了：

- [NGINX 缓存使用官方指南](https://linux.cn/article-5945-1.html) <- 推荐
- [Nginx 反向代理替代 Squid 做 Web 缓存服务器](http://cui.zhbor.com/article/29.html)

-----------------

我下面说一下使用 Nginx 反代缓存时可能遇到的坑：

#### 一、`Cache-Control` HTTP 头

你需要保证你页面的 `Cache-Control` 头部不为 `no-cache`，不然的话 Nginx **默认**是不会缓存的。

#### 二、`Set-Cookie` HTTP 头

同样的，需要缓存的页面响应头中不得含有 `Set-Cookie` 字段，否则 Nginx 也是**默认**不缓存的。然而坑爹的是，Laravel 5.2 默认会给 `routes.php` 中所有的路由套上一个 `StartSession` 中间件，并且给响应头附上 `Set-Cookie`。

在 Laravel 5.3 以后路由文件可以模块化了所以没问题，但是对于由于种种原因无法使用 5.3 的用户（我他喵的还得照顾广大虚拟主机用户们），就要自己解决路由模块化问题了，具体可以参考 [这里](https://laravel-china.org/topics/2484#reply2) 和 [这里](https://github.com/prinsss/blessing-skin-server/commit/8944be0e2a7ad89591e86f57756450043612d462)。

#### 三、反代可能会造成的后端协议判断错误

可以看到我们是把所有请求转发到 `http://localhost:8080` 处理了，但如果你的后端是用请求的 URL 来判断 http/https 的时候就要注意了（譬如坑爹的 Laravel `UrlGenerater` 和 Symfony 的 `Request::isSecure`）。此时的解决方法大致两类，修改后端或者把 `proxy_pass` 中的地址改成 `https`（自己解决证书问题）。

什么？你说设置 `X-Forwarded-Proto`？抱歉，Laravel 所使用的 Symfony Request 并不鸟你，你还需要把你的代理 IP [用一个静态方法传过去](https://github.com/symfony/http-foundation/blob/master/Request.php#L1177) 它才会判断这个头哟~

-------------

如果一切配置无误，你就可以看到你的内容已经被 Nginx 缓存下来啦：

![Screenshot](https://img.prin.studio/legacy/image.php?di=M8Z0)

最后贴一下我的 Nginx 配置：

```
# 设置缓存区域
proxy_temp_path  /data/nginx/temp;
proxy_cache_path /data/nginx/cache levels=1:2 keys_zone=json:100m inactive=1d max_size=1g;

server {
    listen 80;
    server_name skin.prinzeugen.net;
    index index.html index.htm index.php;
    root /home/wwwroot/skin.prinzeugen.net;

    # 显示当前页面的缓存状态
    add_header X-Cache $upstream_cache_status;

    location ~ /(csl|usm|)/?[^/]+\.json {
        proxy_pass        http://localhost:8080;

        # 转发一些客户端信息
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 设置缓存用的 Key
        proxy_cache_key $host$uri$is_args$args;

        proxy_cache json;
        # 设置缓存有效期
        proxy_cache_valid  200 302  1m;
        proxy_cache_valid  404      5m;
        proxy_cache_valid  any      1m;
    }
}
```

以上。
