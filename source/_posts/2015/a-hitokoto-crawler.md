---
title: 写了个一言爬虫
date: '2015-12-27 20:39:48'
updated: '2016-01-31 10:22:42'
categories: 技术
tags:
  - 爬虫
  - Python
  - 一言
---


Python 实现，格式化后文本存储于 `hitokoto.txt`（使用 `\n` 做换行符，用记事本打开发现没有换行可不是窝的锅），已保存的一言 ID 保存在 `hid.txt` 中，带 Save&Load，如果请求到已保存的一言则自动重新请求。本来是想要用数据库的，想想还是算了，反正也没几行（笑）。以后想存数据库的时候，正则一下保存后的格式化文本就好了。

不过用 Python 写这种小脚本真心方便呢w ~

[![hitokoto.py screenshot](https://img.prin.studio/images/2015/12/2015-12-27_04-25-30-1024x414.png)](https://img.prin.studio/images/2015/12/2015-12-27_04-25-30.png)

命令行参数（也可以用 `--help` 查看）：

```
-c    请求的一言数量，整数
-d    请求之间的延迟（秒），浮点数
-a    是否自动重新请求，布尔值
```

源码托管于 [Gist](https://gist.github.com/printempw/8efc424f8033f7f008ed)（打不开请自行解决）。

唔。。最近手生了，写这么点花了将近半天 qwq

单线程（并不想多线程），服务端又是随机返回，所以保存的数量多了以后，效率会很慢。1000 个请求中，999 个是重复的也很常见 qwq 所以还是挂 vps 上慢慢爬吧

[![2](https://img.prin.studio/images/2015/12/2015-12-27_04-47-26.png)](https://img.prin.studio/images/2015/12/2015-12-27_04-47-26.png)

爬太快的话怪不好意思的 [![QQ图片20150919235138](https://img.prin.studio/images/2015/09/2015-09-19_15-53-31.jpg)](https://img.prin.studio/images/2015/09/2015-09-19_15-53-31.jpg)



