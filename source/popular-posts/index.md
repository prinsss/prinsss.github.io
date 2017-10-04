---
title:   最受欢迎的文章
date:    '2016-02-01T15:45:27.000Z'
updated: '2016-04-24T03:59:46.000Z'
---

<ul id="posts">(=ﾟωﾟ)= 加载中……</ul>

<style> #view { float: right; } </style>

<script type="text/javascript">
    (function () {
        var url = "https://work.prinzeugen.net/hexo-view-counter/popular-posts?limit=20";
        var request = new XMLHttpRequest();
    
        request.open("GET", url, true);
        request.send();
    
        request.onreadystatechange = function () {
            var postsContainer = document.getElementById('posts');
    
            if (request.readyState == 4 && request.status == 200) {
                var popularPosts = JSON.parse(request.responseText);
    
                postsContainer.innerHTML = "";
    
                for (var key in popularPosts) {
                    var slug = popularPosts[key]['slug'];
    
                    var post = document.createElement('li');
                    post.setAttribute('id', 'post');
    
                    var link = document.createElement('a');
                    link.setAttribute('href', ('/'+slug+'/'));
                    link.innerHTML = popularPosts[key]['title'];
    
                    var view = document.createElement('small');
                    view.innerHTML = popularPosts[key]['pv'] + " views";
                    view.setAttribute('id', 'view');
    
                    post.appendChild(link);
                    post.appendChild(view);
    
                    postsContainer.appendChild(post);
                }
            } else {
                postsContainer.innerHTML = "加载失败，打开控制台以查看错误详情 :(";
            }
        };
    })();
</script>

------------------------

上面的列表是简单粗暴按照每篇博客文章的「页面访问次数」从高到低进行排列的，所以遗憾的是，很多我自认为写的不错的文章似乎并不受观众姥爷们的欢迎，反倒是很多没什么技术含量的文章高居榜首，这让我多少有些不是滋味。

正因如此，我在这里又放了个手工维护的列表，放的都是些我自认为写得不错的文章们（并不是全部）。如果这些文章对你有所帮助，那就再好不过了；如果没有，那也请对我这小小的私心睁只眼闭只眼吧 ;)

- [快乐的旅途与汇聚的奇迹：《动物朋友》推荐](https://blessing.studio/kemono-friends/)
- [我 TMD 到底要怎样才能在生产环境中用上 ES6 模块化？](https://blessing.studio/how-could-i-use-es6-modules-in-production/)
- [可能是最好的 ss-panel 部署教程](https://blessing.studio/build-shadowsocks-sharing-site-with-ss-panel/)
- [为何 shadowsocks 要弃用一次性验证 (OTA)](https://blessing.studio/why-do-shadowsocks-deprecate-ota/)
- [PHP 远程文件下载的进度条实现](https://blessing.studio/implement-of-php-remote-downloading-with-progress-bar/)
- [Laravel 框架下的插件机制实现](https://blessing.studio/laravel-plugin-system-1/)
- [又是一种 Minecraft 外置登录解决方案：自行实现 Yggdrasil API](https://blessing.studio/minecraft-yggdrasil-api-third-party-implementation/)

如果你想看看我还有其他什么有意思的文章，可以去博客的 [归档](https://blessing.studio/archives/) 页面浏览一下。