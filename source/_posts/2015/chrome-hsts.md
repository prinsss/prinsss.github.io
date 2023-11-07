---
title: 'Chrome 下使支持 https 的站点默认使用 SSL 加密'
date: '2015-07-24 06:27:57'
updated: '2015-07-24 06:30:44'
categories: 技术
tags:
  - SSL
---

有些网站比如 V2EX 支持 https 但是不强制使用 https，在 chrome 下我们可以通过设置使访问 V2EX 强制使用 https 。

方法很简单，在 [chrome://net-internals/#hsts](chrome://net-internals/#hsts) 中添加需要使用 HSTS 的站点即可。

> HSTS (HTTP Strict Transport Security)，HTTP严格传输安全，是一套由互联网工程任务组发布的互联网安全策略机制。网站可以选择使用HSTS策略，来让浏览器强制使用HTTPS与网站进行通信，以减少会话劫持风险。

HSTS 的作用是强制客户端（如浏览器）使用HTTPS与服务器创建连接。

比如，https://example.com/ 的响应头含有 <span class="lang:default decode:true  crayon-inline ">Strict-Transport-Security: max-age=31536000; includeSubDomains</span> 。这意味着两点：

1. 在接下来的一年（即31536000秒）中，浏览器只要向 example.com 或其子域名发送 HTTP 请求时，必须采用 HTTPS 来发起连接。比如，用户点击超链接或在地址栏输入 http://www.example.com/ ，浏览器应当自动将 http 转写成 https，然后直接向 https://www.example.com/ 发送请求。
2. 在接下来的一年中，如果 example.com 服务器发送的 TLS 证书无效，用户不能忽略浏览器警告继续访问网站。

以上内容引自 [中文维基百科](https://zh.wikipedia.org/wiki/HTTP%E4%B8%A5%E6%A0%BC%E4%BC%A0%E8%BE%93%E5%AE%89%E5%85%A8)。



