---
title: 'AUR 软件包的依赖版本太新怎么办'
date: '2020-02-08 03:50:00'
updated: '2020-02-08 03:50:00'
categories: 技术
tags:
  - Linux
---

今天升级软件包时出了点问题，提示是这样的：

```text
$ yay -S qv2ray

==> Error: Could not find all required packages:
    grpc>=1.27.0 (Wanted by: qv2ray)
    grpc-cli>=1.27.0 (Wanted by: qv2ray)
```

[Qv2ray](https://github.com/Qv2ray/Qv2ray/) 新版本添加了不少功能，我也看过 CHANGELOG，新加了 gRPC 的依赖没毛病。但为什么说找不到软件包呢？

<!--more-->

先看看 AUR 上的 Qv2ray [软件包信息](https://aur.archlinux.org/packages/qv2ray/)：

```bash
yay -Si qv2ray
```
```
:: Querying AUR...
Repository      : aur
Name            : qv2ray
Keywords        : gui  qt  qv2ray  v2ray
Version         : 2.0.1-1
Description     : Cross-platform V2ray Client written in Qt (Stable Release)
URL             : https://github.com/Qv2ray/Qv2ray
AUR URL         : https://aur.tuna.tsinghua.edu.cn/packages/qv2ray
Groups          : None
Licenses        : GPL3
Provides        : qv2ray
Depends On      : hicolor-icon-theme  qt5-charts>5.11.0  grpc>=1.27.0
Make Deps       : git  make  qt5-tools  which  gcc  qt5-declarative  grpc-cli>=1.27.0
Check Deps      : None
Optional Deps   : v2ray  v2ray-domain-list-community  v2ray-geoip
Conflicts With  : None
Maintainer      : DuckSoft
Votes           : 5
Popularity      : 1.607244
First Submitted : Wed 28 Aug 2019 09:38:57 PM CST
Last Modified   : Thu 06 Feb 2020 09:49:45 PM CST
Out-of-date     : No
```

嗯，新添加了 `grpc>=1.27.0` 和 `grpc-cli>=1.27.0` 这两个依赖，就是上面报错的东西。

再看看这俩软件包的信息：

```bash
yay -Si grpc
```
```
Repository      : community
Name            : grpc
Version         : 1.26.0-4
Description     : High performance, open source, general RPC framework that puts mobile and HTTP/2 first.
Architecture    : x86_64
URL             : https://grpc.io
Licenses        : BSD
Groups          : None
Provides        : None
Depends On      : c-ares  protobuf  openssl
Optional Deps   : None
Conflicts With  : None
Replaces        : None
Download Size   : 1896.84 KiB
Installed Size  : 11315.30 KiB
Packager        : Massimiliano Torromeo <massimiliano.torromeo@gmail.com>
Build Date      : Thu 02 Jan 2020 04:12:49 PM CST
Validated By    : MD5 Sum  SHA-256 Sum  Signature
```

好嘛！软件源里最新版本才 `1.26.0`，`grpc>=1.27.0` 这个依赖能满足得了才有鬼了。

为什么会这样呢？

- ~~AUR 软件包的维护者是未来人~~
- 你的软件源太旧了

如果你正在使用 Manjaro Linux，那么遇到这种情况并不奇怪。Manjaro 是基于 Arch Linux 的，虽然包管理都是那套，但为了追求稳定，Manjaro 不会像 Arch 那样尽可能快地追软件的版本号，一般都是过一段时间后才会把软件源里的包更新到最新版本（也相对降低了滚挂的风险）。

比如 Arch 软件源里的 `community/grpc` 现在的版本是 `1.27.0`（2020-02-05 更新），而 Manjaro 软件源里依然停留在 `1.26.0`，就造成了开头的那个报错。这个尴尬的情况我之前也碰到过一次，是安装什么软件我忘了，反正当时是 Python 3.8 刚发布就指定了依赖 `python>=3.8`，对于紧跟新版本的 Arch 用户来说自然不算啥，但官方软件源里 Python 还停留在 3.7 的 Manjaro 用户就吃瘪了。

解决方法也有两种。如果这个 AUR 包是**确确实实地需要新版本依赖**，用旧版本的不能跑，那就只能自己想办法安装新版本的依赖了。但是这样比较麻烦，官方软件源里没有又要去别处弄，所以如果现有版本的依赖也能跑的话，可以修改一下 AUR 软件包，让它不要要求那么高，拿旧版本的凑合凑合得了。

获取 `PKGBUILD`（这里以 `yay` 为例，用其他方法获取也一样）：

```bash
yay -G qv2ray
```

修改 `PKGBUILD` 中的依赖版本：

```diff
diff --git a/PKGBUILD b/PKGBUILD
index deef5ab..2628076 100644
--- a/PKGBUILD
+++ b/PKGBUILD
@@ -9,9 +9,9 @@ pkgdesc="Cross-platform V2ray Client written in Qt (Stable Release)"
 arch=('x86_64')
 url='https://github.com/Qv2ray/Qv2ray'
 license=('GPL3')
-depends=('hicolor-icon-theme' 'qt5-charts>5.11.0' 'grpc>=1.27.0')
+depends=('hicolor-icon-theme' 'qt5-charts>5.11.0' 'grpc>=1.26.0')
 optdepends=('v2ray' 'v2ray-domain-list-community' 'v2ray-geoip')
-makedepends=('git' 'make' 'qt5-tools' 'which' 'gcc' 'qt5-declarative' 'grpc-cli>=1.27.0')
+makedepends=('git' 'make' 'qt5-tools' 'which' 'gcc' 'qt5-declarative' 'grpc-cli>=1.26.0')
 provides=('qv2ray')
 source=("Qv2ray-${pkgver}::git+${url}#tag=v${pkgver}")
 sha512sums=('SKIP')
```

安装依赖、构建并安装软件包：

```bash
makepkg -si
```

软件包安装完成：

```bash
pacman -Qi qv2ray
```
```
Name            : qv2ray
Version         : 2.0.1-1
Description     : Cross-platform V2ray Client written in Qt (Stable Release)
Architecture    : x86_64
URL             : https://github.com/Qv2ray/Qv2ray
Licenses        : GPL3
Groups          : None
Provides        : qv2ray
Depends On      : hicolor-icon-theme  qt5-charts>5.11.0  grpc>=1.26.0
Optional Deps   : v2ray [installed]
                  v2ray-domain-list-community [installed]
                  v2ray-geoip [installed]
Required By     : None
Optional For    : None
Conflicts With  : None
Replaces        : None
Installed Size  : 3.35 MiB
Packager        : Unknown Packager
Build Date      : Sat 08 Feb 2020 02:51:10 AM CST
Install Date    : Sat 08 Feb 2020 02:52:02 AM CST
Install Reason  : Explicitly installed
Install Script  : No
Validated By    : None
```

等下一次 Qv2ray 更新的时候，Manjaro 的软件源估计也差不多更新了，到时候再用新版本构建就 OK 了。
