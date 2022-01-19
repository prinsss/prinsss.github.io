---
title: 'Blessing Skin Server 0.1 —— 开源 PHP Minecraft 皮肤站'
date: '2016-01-03 22:24:46'
updated: '2016-01-03 22:26:33'
categories: 技术
tags:
  - Minecraft
  - 皮肤站
  - PHP
---

![bss upload](https://img.prin.studio/images/2016/01/2016-01-03_05-22-44.png)

很久以前就有想写一个皮肤站的想法了，但是苦于没有时间且 PHP、前端的 coding 都不熟练，所以一直搁置着，当作一个目标。

恰逢前几周稍微有点时间（其实是克服了懒癌），就写了一个皮肤站的原型。PHP + MySQL，表单 POST 数据，基本的登录/注册/上传 功能还是实现了的。但是前端完全没有写，全是 webkit 的默认样式。

不过盼星星盼月亮终于等到了元旦假期（连上周末三天），于是把整个项目重构了一下，并且用鞋拔子写了个稍微能看的页面。

前端页面引用的资源/库均位于根目录下的 `/assets` 和 `/libs`，这是不知道从哪里学来的，总之觉得这样挺好的就这样放了（笑）

然后是实现了全站 Ajax，登录/注册 均 POST 请求 `check.php` 返回 json，加入了 SQL 注入防护（虽然还没有 sqlmap 测试过），加入了基于 IP 的注册数量限制，支持保存 cookie，token 验证自动登录。token 就是使用普通的用于验证的不可逆算法得到（用户名 + MD5 密码 + 盐，MD5 二次加密）。

Ajax 文件上传带 token POST 请求 `upload.php`，同样返回 json，上次后的文件位于 `/uploads`。（其实窝觉着这俩可以放一个文件里的）

`user.php` 为用户页面，本来是想用 php 路由到 `/user` 和 `/admin` 等子目录的，但是想想还是算了。因为窝对路由之类的理解并不多，边查边写的话窝也没有那么多时间了。准备放在下一个版本里。

`user.php` 中使用了 djazz 的 [Minecraft Skin Previewer](http://djazz.se/apps/MinecraftSkin/) 实现 3D 皮肤预览（就是 skinme 使用的那个），窝将其封装了一下放入了 three.msp.js 中，可以使用类似 `MSP.getStatus()`、`MSP.changeSkin()` 的接口来访问。

后端就没啥出彩的地方了（话说前端也没有吧），所有使用了数据库连接的操作均封装为函数放在 `connect.php` 里面。不过感觉这个放根目录不合适就是了。

`config.php` 中定义了数据库连接信息，站点名称等常量以供调用。这是从 WordPress 那学来的（笑

遗憾的是由于没有时间，后台管理页面还没写，目前只能通过自己管理数据库和文件的方式来管理用户。而且现在的数据表结构也不支持后台管理 qwq

而且前端的 JS 和 CSS 都写得乱糟糟的，CSS 选择器一半是 id 一般是 class，文件关系也没处理好，没有响应式设计，有些地方还用了绝对定位 ![emotion1](https://img.prin.studio/images/2015/10/2015-10-24_09-56-11.jpg) 

不过由于时间所限，这些都放到下一个版本吧~

- - - - - -

项目开源在 [GitHub](https://github.com/prinsss/blessing-skin-server) 上，欢迎 Pull Request~ 在线演示：[https://skin.prinzeugen.net/](https://skin.prinzeugen.net/)
