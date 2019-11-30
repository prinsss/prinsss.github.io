---
title: '如何将现有 git 仓库中的子目录分离为独立仓库并保留其提交历史'
date: '2018-02-20 19:23:47'
updated: '2018-02-20 19:23:47'
categories: 技术
tags:
  - Git
  - 记录
---

这几天想要把一个 git 仓库中**已经存在**的一个子文件夹独立成一个新的 git 仓库，并且保留之前关于此文件夹的所有提交历史。不过我对 git 并没有这么精通，只好上网搜索之。可能是因为我关键词抓得不准，搜了好一会儿才找到可行的方案，所以写篇博文记录一下。

另外，在 git 里这种掌控历史的感觉真的很棒。XD

<!--more-->

## 0x01 需求分析

我为什么会有如本文标题所述这样的需求呢？这是因为我之前把所有为 [Blessing Skin](https://github.com/printempw/blessing-skin-server) 这个程序编写的插件源码都放在一个 [git repo](https://github.com/printempw/blessing-skin-plugins) 中了，每个子文件夹中都是一个独立的插件（因为嫌麻烦所以一股脑给塞进一个仓库里了），并且对每个子文件夹中的代码的修改最后都是在这个统一仓库中提交的。该仓库差不多长这样：

```text
$ tree
├── .git
├── avatar-api
├── config-generator
├── register-email-validation
│   ├── bootstrap.php
│   ├── package.json
│   └── src
├── report-texture
└── yggdrasil-api  <---【我想把这个独立为一个新 repo】
    ├── bootstrap.php
    ├── package.json
    ├── routes.php
    └── src
```
而我现在后悔了，想把其中的某个子目录抽离出来，把它变成一个新的 git 仓库，并且保留我之前所有在「原仓库」中关于这个子目录的「所有提交历史」。

其实这种需求还是挺常见的，举个栗子：

> 你原本在一个项目的 git 仓库中维护了一个通用的组件库，本来以为这只是个小玩意，谁曾想随着项目的开发这个库变得越来越大，代码变得越来越复杂，不再合适与主项目代码放在同一个 repo 里了。
>
> 这时你想把这个库抽离出来变成一个单独的 git repo 然后在原 repo 中使用 submodule 之类的方法引用之的时候，却发现之前的 repo 中已经有太多关于这个库的提交记录了，而你又不想让这个新 repo 直接一个 Initial Commit 唐突地就变成现在这个样子……

这就是这篇文章所希望解决的需求：

**将现有 git repo 中的子目录独立为新 repo，并保留其相关的提交历史。**

## 0x02 文章描述约定

为了方便描述后续操作，这里稍微约定一下文章中各占位符的含义。

- 原来的仓库 👉 `<big-repo>`
- 想要分离出来的子文件夹名称 👉 `<name-of-folder>`
- 该子文件夹形成的新仓库 👉 `<new-repo>`

也就是说：我们有一个叫做 `big-repo` 的仓库，里面有不少子文件夹，我们想要把其中一个文件夹抽离出来，将其变成一个新的仓库 `new-repo`，并且保留之前在 `big-repo` 中所有关于这个子文件夹的所有 commit 记录。

差不多就是这样。(・_ゝ・)

## 0x03 最简单的方法，使用 git subtree

看来上述需求还是比较普遍的，自从 1.8 版本之后 git 就添加了 subtree 子命令，使用这个新命令我们可以很简单高效地解决这个问题。

首先，进入 `big-repo` 所在的目录，运行：

```bash
git subtree split -P <name-of-folder> -b <name-of-new-branch>
```

运行后，git 会遍历原仓库中所有的历史提交，挑选出与指定路径相关的 commit 并存入名为 `name-of-new-branch` 的临时分支中。另外需要注意的是，**如果你在使用 Windows**，且该文件夹深度 > 1，你必须使用斜杠 `/` 作为目录分隔符而不是默认的反斜杠 `\`。

然后，我们创建一个新的 git 仓库：

```bash
mkdir <new-repo>
git init
```

接着把原仓库中的临时分支拉到新仓库中：

```bash
git pull </path/to/big-repo> <name-of-new-branch>
```

好了，完成。现在看看你的新仓库，是不是已经包含了原子文件夹中的所有文件和你之前在原仓库中的所有提交历史呢？

## 0x04 麻烦点的方法，使用 git filter-branch

除了使用新添加的 `subtree` 命令，你也可以使用 git 传统的所谓核弹级大杀器命令 —— `filter-branch` 解决上述问题。

首先，clone 一份原仓库并删掉原来的 remote：

```bash
git clone <big-repo> <new-repo>
cd <new-repo>
git remote rm origin
```

然后运行如下命令（这是重点）：

```bash
git filter-branch --tag-name-filter cat --prune-empty --subdirectory-filter <name-of-folder> -- --all
```

这条命令同样会过滤所有历史提交，只保留所有对指定子目录有影响的提交，并将该子目录设为该仓库的根目录。这里说明各下个参数的作用：

- `--tag-name-filter` 该参数控制我们要如何处理旧的 tag，cat 即表示原样输出；
- `--prune-empty` 删除空的（对子目录没有影响的）提交；
- `--subdirectory-filter` 指定子目录路径；
- `-- --all` 该参数必须跟在 `--` 后面，表示对所有分支进行操作。如果你只想保存当前分支，也可以不添加此参数。

该命令执行完毕后就可以看到新仓库中已经变成子目录的内容了，且保留了关于该子目录所有的提交历史。不过只是这样的话新仓库中的 `.git` 目录里还是保存有不少无用的 object，我们需要将其清除掉以减小新仓库的体积（如果你用上面 `subtree` 的方法的话是不需要执行这一步的）。

```bash
git reset --hard
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d
git reflog expire --expire=now --all
git gc --aggressive --prune=now
```

这样，虽然麻烦点，我们也得到了和使用 0x03 方法后一样的新仓库。

## 0x05 清理原仓库

既然所指定的子文件夹已经被分离为一个单独的 git repo 了，我们就可以放心地在原仓库中删除它了：

```bash
git rm -rf <name-of-folder>
# 提交一下说明对应操作
git commit -m 'Remove some fxxking shit'
# 删除刚才创建的临时分支
# 后一种方法不需要执行这一步
git branch -D <name-of-new-branch>
```

不过这种方法还是会在提交历史中保留所有关于这个子目录的内容，如果你想要把这个子目录从原 repo 中**不留一丝痕迹地完全移除**，那你需要 BFG Repo Cleaner 这样的工具或者使用 `filter-branch` 等命令。

关于这个的具体操作我这里就不提了，网上一搜一大把。不过需要注意的是，这种做法并不值得提倡，请在你完全清楚自己在做什么的前提下使用此方法改写提交历史。

## 0x06 关联原仓库与新仓库

这一步是可选的。

一般来说，在我们把原目录中的子文件夹分离成独立的 git 仓库后，总会希望再通过某种方法在原仓库中引用新仓库的代码。

这里我们可以通过 `subtree` 或者 `submodule` 两种命令来实现，不过他们两个各有优点和缺点，所以请根据你自己的实际情况选择（不过现在一般都推荐使用 subtree，submodule 用起来实在是太他妈的蛋疼了）。

当然，你也可以分离之后直接使用 npm、composer 之类的包管理器将新仓库作为一个依赖库引入进来，这也是完全没有问题的。

## 0x07 参考链接

- [Detach (move) subdirectory into separate Git repository](https://stackoverflow.com/questions/359424/detach-move-subdirectory-into-separate-git-repository)
- [Create a submodule repository from a folder and keep its git commit history](https://stackoverflow.com/questions/17413493/create-a-submodule-repository-from-a-folder-and-keep-its-git-commit-history)
- [如何把 GIT 仓库的子目录独立为子模块](http://graycarl.me/blog/make-a-directory-into-git-submodule)


啊，另外，上次说好的 WSL 博文可能要鸽了抱歉咕咕咕。
