---
title: '使用 Git 生成增量更新包'
date: '2016-08-11 22:18:00'
updated: '2016-08-11 22:30:52'
categories: 技术
tags:
  - 踩坑
  - Git
---

上次有人叫我在 Blessing Skin 每次升级的时候带上一个增量更新包，只包含所有上一个版本后修改过的文件。

我听到这个需求，最开始想到的是使用 `git diff --name-only`，加上这个参数后可以只显示 commit 之间修改过的文件名，然后就可以用管道通给 zip 之类的程序来压缩。

去网上搜了搜，发现还有[更简单的方法](http://www.cnblogs.com/lhb25/p/10-useful-advanced-git-commands.html)：

```shell
$ git archive -o ../latest.zip NEW_COMMIT_ID $(git diff --name-only OLD_COMMIT_ID NEW_COMMIT_ID)
```

这是用了 `git archieve` 命令，本质上和我上面说的也差不离。

如果你打了 tag，就可以写成这样：

```shell
$ git archive -o ../latest.zip HEAD $(git diff --name-only v3.0.1 HEAD)
```

是不是很方便呢 |∀` )
