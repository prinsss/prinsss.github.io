---
title:   '使用 Travis CI 自动部署 Hexo 博客'
date:    '2017-10-04 10:50:41'
updated: '2017-10-04 10:50:41'
categories: 技术
tags:
  - Hexo
  - 博客
  - 持续集成
---

之前（六月份高考完后）我把博客引擎由 Ghost [换成了静态博客生成器 Hexo](https://printempw.github.io/migrated-to-hexo/)，并且只使用了自带的 Git Deployment 来手动部署生成好的静态博客文件到服务器上。虽然不像动态博客程序那样可以随时随地更新博客，但是想到马上就要上大学了，之后手头都会有电脑，所以更新博客也不算那么麻烦。

但是实在是人算不如天算，浙江这一届新高考改革是结结实实地把我坑了一把。二段线以上一段线未满这样中途半端的分数让人在填志愿时着实是犯难 —— 这次浙江几乎普遍出现「一段考生抢以往的二本中好学校，二段考生抢三本学校」这样神秘的情况。思来想去最后把心一横，决定去再读一年高四。后来全省高考录取情况出来后，也证实了我当时复读的决定也不是不合理的（譬如当时上了新浪微博热门话题的「浙江滑档大学」等）。

关于复读的话题就先放一放吧，毕竟现在的时间确实是有些紧，可能得等到寒假时才能好好地写一篇近况报告以及关于高四生活的事情了，非常遗憾。

回到正题，因为我输得透彻滚去读高四了，所以自然不可能每次都有配置完好的操作环境让我手动发博文 + 部署（虽然我也不见得有时间写什么博文）。在这样的前提条件下，一个 Hexo 博客的自动部署（持续集成）系统就显得非常有必要了。

<!--more-->

## 0x01 需求分析

首先我们需要了解的是，我们到底希望实现一个怎样的系统？以下是我的设想：

1. 更新博客文章内容后 commit 到 GitHub repo（也可以直接在 GitHub 网页上 commit）；
2. Travis CI 自动编译生成出新的静态博客文件；
3. 自动部署至 GitHub Pages 和我自己的服务器。

虽然互联网上关于自动部署 Hexo 博客的文章已经有很多了，但是我这里还是有些需求是和他们不一样的：

1. 我所使用的 Seventeen 主题源码存放在 [Gitee](https://gitee.com/) （就是原来的 Git@OSC）上的私有仓库中（毕竟这主题只是我移植到 Hexo 上来的，主题版权依然属于[原作者](https://qaq.cat/)）；
2. 需要同时部署至 GitHub Pages 和我自己的 VPS 上。

折腾期间也是踩到了一些坑，也在这里记录一下。

## 0x02 配置 GitHub 仓库

说实话我之前都没用过 GitHub Pages，也没打算直接用它来存放我的博客（[blessing.studio](https://printempw.github.io/) 依然部署在我的 VPS 上）。不过想想之后我也没有搞运维的时间了，多来几个博客的存档备份也是好的（反正也是免费的，笑）。

怎样启用 GitHub Pages 我就不多说了，智力正常的人应该都能完成这些操作。因为域名是以用户名开头的 User Pages 默认只能显示 master 分支里的内容（我也懒得去弄 Custom domain 啥的），所以我用了不同的分支来存放不同的内容：

- **master** 存放 Hexo 生成好的静态文件，所有 commit 信息格式均为 `Site updated: %Y-%m-%d %H:%M:%S`；
- **source** 存放 scaffolds（脚手架）、source（文章 Markdown 源码）、_config.yml（Hexo 配置）等文件，commit 信息前都加上对应的 emoji（确实蛮好玩的，参见 [gitmoji](https://gitmoji.carloscuesta.me/)），并设置为 repo 的默认分支。

分支操作大概像这样：

```shell
git init
git remote add origin git@github.com:printempw/printempw.github.io.git
# 新建 source 分支
git checkout --orphan source
git add .
git commit -m ":tada: Initial commit"
git push origin source:source
```

最后这个 repo 的画风是这样的：

![snipaste_20171004_201448.png](https://img.prin.studio/images/2017/10/04/snipaste_20171004_201448.png)

![snipaste_20171004_201526.png](https://img.prin.studio/images/2017/10/04/snipaste_20171004_201526.png)

我是觉得挺不错的，你说呢？

## 0x03 配置 Travis CI

怎么登录 Travis CI 并关联 GitHub 项目我也一样不多说，只要智力正常以下略。

下面主要讲一下如何编写 `.travis.yml` 配置文件。

### 0x31 配置部署秘钥

我博客的部署过程中需要用到 ssh 密钥认证的地方大概有这几处：

- 从 Gitee 私有仓库 clone 主题；
- 将编译好的文件 push 到 GitHub Pages 和 VPS。

一般网上的文章只有一个自动 push 到 GitHub Pages 的需求，所以直接申请一个 GitHub 的 Personal access tokens，配合 Travis 的环境变量配置就可以拿到 push 权限了。不过我这里情况复杂一些，所以不如直接搞个部署秘钥来得方便（而且那个 token 是可以操作所有 repo 的，更不安全）。

首先，新生成一个 ssh 密钥对（不要嫌麻烦直接把你机器上的秘钥拿去用了，太危险）：

```shell
# 随便生成在哪都行，文件名也随意
$ ssh-keygen -f travis.key
```

然后把生成的公钥文件（e.g. `travis.key.pub`）分别添加到 GitHub Deploy Keys（在哪你自己找呀）、Gitee 部署秘钥、VPS 上的 `~/.ssh/authorized_keys` 中，这样 Travis CI 的机器就可以直接访问这些服务器了。

那我们要怎么在 Travis CI 自动部署过程中使用这个私钥呢？直接放在 repo 里提交上去肯定是不行的；而且那么长一串的私钥，总不能设置成环境变量吧（摊手）。

不过好在 Travis CI 提供了文件加密工具，这样我们就可以直接把加密后的私钥提交到 git repo 中，然后在 Travis CI 自动部署过程中解密出原秘钥并使用了（网上还有其他神秘的加密方法，但是没几个有 openssl aes-256-cbc 加密这样靠谱）。

首先，我们需要安装 Travis 的命令行工具：

```shell
# 是的，你没看错，Travis 的命令行工具是用 Ruby 写的
# 所以，想要用它你还得去安装 Ruby 环境……去吧，我的朋友
$ sudo gem install travis
```

然后通过命令行登录 Travis 并加密文件：

```shell
# 交互式操作，使用 GitHub 账号密码登录
# 如果是私有项目要加个 --pro 参数
$ travis login --auto
# 加密完成后会在当前目录下生成一个 travis.key.enc 文件
# 还会在你的 .travis.yml 文件里自动加上用于解密的 shell 语句
# 还 tmd 会自动格式化你的 .travis.yml 文件，去他妈的
$ travis encrypt-file travis.key -add
```

需要注意的是，这些文件加密步骤**不能**在 Windows 系统下完成，不然在自动部署时会出现神秘的错误（wrong final block length）。这个问题已经被很多人[报告过了](https://github.com/travis-ci/travis-ci/issues/4746)（实际上我也踩上去了），并且[官方文档](https://docs.travis-ci.com/user/encrypting-files/)里也加上了这样一段话：

![Caveat](https://img.prin.studio/images/2017/10/04/snipaste_20171004_204633.png)

总之就是「辣鸡 Windows 太菜了不行，给我用 WSL 或者类 Unix 系统吧哈哈哈」的意思（迫真）经过我的测试，Windows10 下的 babun、Git Bash 均告失败，WSL（Windows Subsystem for Linux）和我 VPS 上的 Ubuntu 14.04 所生成的加密文件均可通过自动部署，屁事儿没有。

以上步骤完成后你会得到一个 `travis.key.enc`，然后你把这玩意放到 repo 的哪里去都成，随你喜欢，只要能访问得到就可以（比如说我放到了 `.travis` 目录里）。然后在 `.travis.yml` 可以使用如下命令解密出原本的 ssh 私钥：

```
# 环境变量 $encrypted_1fc90f464345_key 中的那一串字符是随机的，每个人都不一样，自己机灵点儿改成你自己的。这个环境变量名也可以在 Travis CI 的项目后台环境变量设置中查看
openssl aes-256-cbc -K $encrypted_1fc90f464345_key -iv $encrypted_1fc90f464345_iv -in .travis/travis.key.enc -out ~/.ssh/id_rsa -d
```

搞定了密钥认证后，我们还需要修改一下机器的 SSH 配置。为啥呢？

![snipaste_20171004_205715.png](https://i.loli.net/2017/10/04/59d4dac7a6381.png)

相信大家对于上面的提示并不陌生 —— 每次我们使用 ssh 尝试连接到一个我们之前没有连接过的服务器时都会出现这样的提示。但是在 Travis CI 的自动部署过程中是不接受任何命令行输入的（好像可以，但是很麻烦），所以我们必须想办法把这个确认过程给干掉，否则自动部署就会被卡在这里直到超时了。

网上搜一搜就能知道管这玩意的是 `./ssh/config` 里的 `StrictHostKeyChecking` 配置项，所以我们可以在项目里写一个自己的 ssh 配置文件，然后在自动部署过程中替换掉 Travis CI 机器的 ssh 配置：

```
# 文件 [.travis/ssh_config]
Host github.com
    User git
    StrictHostKeyChecking no
    IdentityFile ~/.ssh/id_rsa
    IdentitiesOnly yes

Host gitee.com
    User git
    StrictHostKeyChecking no
    IdentityFile ~/.ssh/id_rsa
    IdentitiesOnly yes

Host prinzeugen.net
    User git
    StrictHostKeyChecking no
    IdentityFile ~/.ssh/id_rsa
    IdentitiesOnly yes

# 文件 [.travis.yml]
mv -fv .travis/ssh-config ~/.ssh/config
```

也有另外一种方法是通过在 `.travis.yml` 中添加 `ssh_known_hosts` 来实现的（具体可以看 Travis CI 的 [官方文档](https://docs.travis-ci.com/user/ssh-known-hosts/)），不过上面的方法灵活性更高（是的，我是写到这里才发现还有这种方法……上面的我也懒得删了，就放在那吧，括弧笑）。

```yml
addons:
  ssh_known_hosts:
  - github.com
  - gitee.com
  - prinzeugen.net
```

这样一来，就没有什么能阻挡我们的自动部署过程啦 ![表情](https://img.prin.studio/images/2017/10/04/QQ20171004210320.jpg)

### 0x32 编写 .travis.yml

我就直接贴我自己的配置了（放在 [Gist](https://gist.github.com/printempw/42e8781ed3adadbcc6ecac01904a32f6) 上，加载不出来的自己想办法），诸位看着修改：

<script src="https://work.prinzeugen.net/gist/printempw/42e8781ed3adadbcc6ecac01904a32f6.js"></script>

大部分语句都加了注释，我也就不再多说明了。

如果不出意外，每次 push 新 commit 到 source 分支后，Travis CI 就会自动帮你构建最新的静态博客，并部署至 Github Pages 和你自己的 VPS 上了。

![Travis CI Build Status](https://img.prin.studio/images/2017/10/04/snipaste_20171004_212745.png)

## 0x04 后记

打开博客一看，上一篇博文已经是两个月之前的事情了。复读开学之后这段时间确实是挺忙的，每天晚上回寝室后屌累屌困，最多也就记记账，看看邮件，看看 RSS，闲的话刷刷 Twitter，确实是没有什么时间像这样坐下来写一篇文章了。

估计以后博文更新频率也会越来越低吧，唉。

### 0x41 参考链接

- [Hexo + GitHub + Travis CI + VPS 自动部署](https://changkun.us/archives/2017/06/232/)
- [使用 Travis CI 自动部署 Hexo 博客](http://www.itfanr.cc/2017/08/09/using-travis-ci-automatic-deploy-hexo-blogs/)
- [使用 Travis 自动部署 Hexo 到 Github 与 自己的服务器](https://segmentfault.com/a/1190000009054888)
- [用 Travis CI 自動部署網站到 GitHub](https://zespia.tw/blog/2015/01/21/continuous-deployment-to-github-with-travis/)
