---
title: 'Manjaro Linux 踩坑调教记录'
date: '2019-11-23 22:26:53'
updated: '2020-01-23 18:30:00'
categories: 技术
tags:
  - Linux
  - Manjaro
---

去年买的游戏本重得要死，续航又差，背出去简直像个傻 X。所以这次双十一对比了一下最近的机器，新添置了一台轻薄本 —— 荣耀 MagicBook 2019 锐龙版。Ryzen 5 3500U，8 + 512G，￥3499，香疯了！AMD YES！

之前我就听说过 Manjaro 这个 Arch Linux 的衍生发行版有多么多么赞~~（洗手.jpg）~~，既然这次正好机器也没预装 Windows，就打算在实机上安装体验一下。这是我第一次在日常生活中使用 Linux 作为主力操作系统（以前要么是虚拟机要么是 WSL），从结果来看，不得不说实际体验还是非常不错的。

虽然 Linux 桌面对普通用户依然不友好（你看这篇文章配置各种软件写了这么长就知道了……），不过对于我这种算不上非常 geek 但还是懂一些 Linux 知识的人来说，只需要进行一番配置就能用得很舒适 —— 网页浏览、影音视听、聊天通讯、文档编辑、编程开发，实际几天日常使用下来，一点问题也没有，远超我的预期。

<!--more-->

Manjaro 不是我第一个使用过的发行版，但绝对是我用得最爽的一个。很大一个原因就是其背靠的 Arch Linux 完善的社区与超全的软件包仓库 —— 我用到现在，几乎所有软件都是包管理器安装的，遇到的大部分问题 Wiki 里都有。再也不用像以前用 Ubuntu 系那样添加各种 PPA 或者 `dpkg`、`make install` 啦！懒人福音！

选择 Linux 发行版，其实 DE 之类的外观都是次要的（有心美化都能实现一样的效果），主要还是看它提供的软件包和社区。完善的软件生态带来的用户体验提升真的不是一点半点。比如我以前被 elementary OS 的外观吸引而使用过一段时间，好看是挺好看，但其基于 Ubuntu 的软件包管理实在是说不上舒适。

好了废话不多说，开始正文吧。本文主要记录了我在配置系统和各种软件时的过程以及遇到的坑，希望对你有所帮助。如果有什么问题，也欢迎在评论区向我提问。

## 安装

Manjaro 官方提供了好几个 DE 的版本，我选择的是 GNOME 版。

https://manjaro.org/download/

下载 ISO 镜像制作启动盘（别用那些乱七八糟的启动盘制作工具，可能会无法启动，推荐使用 [Rufus](https://rufus.ie/)），从 U 盘启动一路安装就完事儿了。

需要注意的是要在 BIOS 中关闭 Secure Boot，不然会 boot failed。

## 镜像源

设置国内镜像源，选快的就行：

```bash
sudo pacman-mirrors -c China -i -m rank
```

archlinuxcn 软件源我没用，有需要的自己配置一下吧。

第一次滚动更新：

```bash
# 同步包数据库并升级所有软件包
sudo pacman -Syu
```

## HiDPI

本子是 13 寸 1080P 屏，不缩放狗眼要瞎的。

GNOME 对于 HiDPI 的支持似乎还是不怎么样，显示配置里屏幕缩放只能 100%、200% 地调节。查了不少资料，有说先放大到 200% 再用 `xrandr --output eDP --scale 1.25x1.25` 缩小，但实际测试效果很糟糕。

最后测试下来直接设置字体缩放效果最好：

```bash
gsettings set org.gnome.desktop.interface text-scaling-factor 1.2
```

浏览器方面，Firefox 和 Chrome 都需要手动设置一下缩放。

**Firefox**

打开 `about:config`，设置 `layout.css.devPixelsPerPx` 为合适的数值。我设置为了 1.2。

**Chrome**

编辑 `~/.config/chrome-flags.conf` 添加如下参数：

```
--force-device-scale-factor=1.2
```

另外大部分 electron 程序都有自带缩放选项（VS Code、discord），可以在设置中调整。

## AUR

因为 pacman 包管理器本身并不直接支持 AUR，所以我们要装个 [AUR helper](https://wiki.archlinux.org/index.php/AUR_helpers)，打开通往快乐的大门。

Manjaro 自带的 pamac 图形化包管理器在设置中即可开启 AUR 支持。命令行下我选用了 [yay](https://github.com/Jguer/yay)，可以直接从官方 community 仓库中安装：

```bash
# 后面那个是编译包时需要的一些工具，不然会报错缺少 fakeroot 之类的
sudo pacman -S yay base-devel
# 设置 AUR 清华镜像源
yay --aururl "https://aur.tuna.tsinghua.edu.cn" --save
# 开启 pacman 和 yay 的彩色输出
sudo sed -i "s/#Color/Color/g" /etc/pacman.conf
```

另附 pacman 的[一些基本操作](https://www.cnblogs.com/kirito-c/p/11181978.html)供参考，和 apt 还是蛮不一样的：

```bash
pacman -S package_name        # 安装软件
pacman -S extra/package_name  # 安装不同仓库中的版本
pacman -Syu                   # 升级整个系统，y 是更新数据库，yy 是强制更新，u 是升级软件
pacman -Ss string             # 在包数据库中查询软件
pacman -Si package_name       # 显示软件的详细信息
pacman -Sc                    # 清除软件缓存，即 /var/cache/pacman/pkg 目录下的文件
pacman -R package_name        # 删除单个软件
pacman -Rs package_name       # 删除指定软件及其没有被其他已安装软件使用的依赖关系
pacman -Qs string             # 查询已安装的软件包
pacman -Qi package_name       # 查询本地安装包的详细信息
pacman -Ql package_name       # 获取已安装软件所包含的文件的列表
pacman -U package.tar.zx      # 从本地文件安装
pactree package_name          # 显示软件的依赖树
```

yay 的用法与 pacman 完全类似，上述所有 `pacman xxx` 命令，均可替换成 `yay xxx` 执行。

此外，还有一条 yay 命令值得记一下：

```bash
yay -c  # 卸载所有无用的依赖，类似 apt autoremove
```

## 加速 AUR 包构建

默认情况下 `makepkg` 构建 AUR 包时会启用压缩，构建完了安装又要再解压一次，如果只是自己机器上使用的话，实在是没必要（而且大软件包压缩很慢）。

设置构建包时不进行压缩：

```bash
sudo sed -i "s/PKGEXT='.pkg.tar.xz'/PKGEXT='.pkg.tar'/g" /etc/makepkg.conf
```

## 输入法

系统安装好后是没有中文输入法的，需要手动安装配置。

输入法框架个人习惯使用 fcitx，输入法则是选择了口碑很好的 Rime：

```bash
# 个人还需要个日语输入法
sudo pacman -S fcitx-rime fcitx-mozc
# 对不同 GUI 框架的支持，全部安装
sudo pacman -S fcitx-im
# 图形化配置界面
sudo pacman -S fcitx-configtool
```

编辑桌面启动脚本，注册输入法模块并支持 xim 程序（有些文章会让你放到 `~/.xprofile` 里去，这之间有些差别，还是按照 Arch Wiki 上的来吧），注销重新登录后生效：

```bash
vim ~/.pam_environment
```
```
GTK_IM_MODULE=fcitx
QT_IM_MODULE=fcitx
XMODIFIERS=@im=fcitx
```

图形化配置界面中删除自带的拼音输入法，添加 Rime 与 Mozc：

![fcitx-gui-add-im](https://img.blessing.studio/images/2019/11/23/fcitx-gui-add-im.png)

如果添加界面中找不到新安装的输入法，可以在菜单中重启一下 fcitx。

一些常用的默认快捷键：

- <kbd>Ctrl</kbd> + <kbd>Space</kbd> 激活输入法
- <kbd>左Shift</kbd> 临时切换到英文
- <kbd>Ctrl</kbd> + <kbd>Shift</kbd> 输入法间切换
- <kbd>-</kbd> / <kbd>=</kbd> 向前/向后翻页
- <kbd>Shift</kbd> + <kbd>Space</kbd> 全角、半角切换

本来输入法和输入方案是可以在托盘的 fcitx 图标的菜单中切换的，但是我的 GNOME 上不知道为什么打不开 dropdown 菜单（点一下马上就收起来，终极拼手速），只好手动修改配置文件了：

```bash
vim ~/.config/fcitx/rime/default.custom.yaml
```
```
patch:
  "menu/page_size": 7
  schema_list:
    - schema: luna_pinyin_simp
    - schema: luna_pinyin
```

输入方案也可以在切换至 Rime 时按 F4 或者 <kbd>Ctrl</kbd> + <kbd>`</kbd> 切换，不过我基本只用得到这俩。

Rime 自身的具体配置这里不再赘述，实在是太复杂了，有兴趣的可以参考一下网上其他人分享的配置文件。

另外再装个输入法皮肤，不然默认的太丑：

```bash
mkdir -p ~/.config/fcitx/skin
yay -S fcitx-skin-material
# 在图形界面中修改使用的皮肤或者手动修改配置文件
vim ~/.config/fcitx/conf/fcitx-classic-ui.config
```

看起来还不错：

![fcitx-change-skin-material](https://img.blessing.studio/images/2019/11/23/fcitx-change-skin-material.png)

## GNOME 桌面美化

### 主题

自从 Windows XP 以来就没怎么折腾过系统美化了……还蛮怀念的。

GNOME 换主题很方便，而且 Manjaro 预装了 GNOME Tweaks，所以装就完事儿了。[Gnome-look.org](https://www.gnome-look.org/) 中有很多主题，各种风格一应俱全（比如仿 macOS 的，仿 macOS 的和仿 macOS 的）。

个人很喜欢 Ubuntu 默认的 [Yaru](https://github.com/ubuntu/yaru/) 主题，可以直接从 AUR 安装：

```bash
yay -S yaru-gnome-shell-theme yaru-gtk-theme yaru-icon-theme yaru-session
```

在 GNOME Tweaks 里指定主题：

![gnome-tweaks-set-theme-yaru](https://img.blessing.studio/images/2019/11/23/gnome-tweaks-set-theme-yaru.png)

~~这样配合下面的 GNOME Shell 扩展就可以实现 Ubuntu 拟态啦。（x）~~

不过 yaru-gnome-shell-theme 目前还不能直接在 Tweaks 中指定，需要在登录页面修改 session（点登录按钮旁边的齿轮图标，选择 `yaru-session`）。看 AUR 软件包评论中说后续版本会改进，期待一下。

### Shell 扩展

原生的 GNOME 桌面其实并不是很好用，但是加上了各种扩展之后就会变得很强大（包括 Dock 之类的）。你可以在 [extensions.gnome.org](https://extensions.gnome.org/) 中查看所有可用的扩展。

>  如果你疑惑为什么叫 Shell，gnome-shell 和 gnome-terminal 有什么区别的话，可以看看 [这篇文章](https://printempw.github.io/the-difference-between-cli-terminal-shell-tty/)。

Manjaro 默认安装就自带了这些 GNOME Shell 扩展：

- `gnome-shell-extension-appfolders-manager` 支持在「应用程序」视图中给程序按文件夹分类。需要注意的是开启之后会导致 Dock 上图标无法排序、文件夹无法重命名的问题，应该是 BUG；
- `gnome-shell-extension-appindicator` 显示各种托盘图标；
- `gnome-shell-extension-arc-menu` 应用菜单，有点类似 Windows 开始菜单；
- `gnome-shell-extension-dash-to-dock` 喜闻乐见的 Dock；
- `gnome-shell-extension-dash-to-panel` 类似 Windows 的底部任务栏，取代顶栏和 Dock；
- `gnome-shell-extension-desktop-icons` 没错，显示桌面图标还得要个扩展……而且效果还不怎么样，你甚至不能从桌面拖拽文件到其他程序里，只能从文件管理器里拖；
- `gnome-shell-extension-gsconnect` KDE Connect 协议的 GNOME Shell 实现，可以连手机啥的；
- `gnome-shell-extension-openweather` 显示天气预报。

我另外还安装了这些扩展：

- `gnome-shell-extension-clipboard-indicator-git` 剪贴板管理；
- `gnome-shell-extension-status-area-horizontal-spacing` 减少顶栏图标间隔，有些主题默认的图标 padding 超大，还是紧凑点好看些。Unite 也有同样的功能，不要两个一起用；
- ~~`gnome-shell-extension-topicons-redux` TopIcons、TopIcons Plus、TopIcons Redux……哪个能用就用哪个吧，用于集成 Wine 的托盘图标。Redux 是重构版但是目前还有点问题，装完得自己 patch 一下~~
  （Unite 自带托盘图标功能）；
- `gnome-shell-extension-unite` 窗口最大化时合并顶栏与标题栏，防止出现三重额头；
- [`remove-accessibility`](https://extensions.gnome.org/extension/112/remove-accesibility/) 这个目前 AUR 里还没有。开启字体缩放后（参见上面 HiDPI 配置）顶栏上会出现一个 Accessibility 的图标，还蛮烦人的，用这个把它隐藏掉。

每个扩展都有不少配置（扩展开关左边的齿轮图标），调整配置上花了我不少时间。

![gnome-tweaks-extensions](https://img.blessing.studio/images/2019/11/23/gnome-tweaks-extensions.png)

最后我的桌面是这样的：

![my-gnome-desktop](https://img.blessing.studio/images/2019/11/23/my-gnome-desktop-compressed.png)

## 常用软件

安装一些常用软件（基本全都可以在官方源或者 AUR 中找到）：

- `visual-studio-code-bin` 爽死了
- `guake` ~~挂科~~ 雷神终端，快捷键呼出很好用
- `gimp` 图像编辑
- `google-chrome` 骂归骂，用还是要用的
- `typora` Markdown 编辑器，我这篇文章就是用这写的
- `flameshot` 截图，GNOME 自带的不太好用
- `qv2ray` 科学上网，SS 用户可以用 `shadowsocks-qt5` 或者  `electron-ssr`
- `eog` 默认的图片浏览器是 gThumb，用不惯

国内躲不开的 QQ 微信也可以一键安装（以 TIM 为例）：

```bash
# 不要装成 deepin-wine-tim 了，那个不能用
yay -S deepin.com.qq.office
# 修复 TIM 字体发虚
yay -S lib32-freetype2-infinality-ultimate
# Wine HiDPI 缩放
env WINEPREFIX="$HOME/.deepinwine/Deepin-TIM" deepin-wine winecfg
```

当然，你也可以试试之前诈尸的 Linux 版 QQ，感受一下复古风格：

```bash
yay -S linuxqq
```

再装个 WPS，实际使用下来确实挺良心的：

```bash
yay -S wps-office wps-office-fonts wps-office-mime ttf-wps-fonts
```

Manjaro 自带了思源系列字体（Noto 家族），补个 Emoji：

```bash
yay -S noto-fonts-emoji
```

修复有的 Emoji 显示为黑白符号的问题（[ref](https://github.com/stove-panini/fontconfig-emoji/)）：

> 可能会造成 Powerline 中的 ✔ 等字符显示异常（变成彩色 emoji），有时间再研究下。

```bash
mkdir -p ~/.config/fontconfig/conf.d/
cd ~/.config/fontconfig/conf.d/
wget https://github.com/stove-panini/fontconfig-emoji/raw/master/69-emoji.conf
wget https://github.com/stove-panini/fontconfig-emoji/raw/master/70-no-dejavu.conf
```

如果要装 Source Hans Sans/Serif 的，注意一下几个版本的区别：

```bash
# CN 的是 Region-Specific Release，字库较小
# Source Hans Sans CN 和 Source Hans Sans SC/TC/... 的区别
adobe-source-han-sans-cn-fonts
adobe-source-han-sans-otc-fonts
adobe-source-han-serif-cn-fonts
adobe-source-han-serif-otc-fonts
```

再来装一些命令行工具：

- `tldr` 简化版文档，谁用谁知道
- `proxychains` 解决命令行程序挂代理的老大难问题（[对 Go 编写的程序无效](https://github.com/rofl0r/proxychains-ng/issues/199#issuecomment-340183417)）
- `oh-my-zsh` 简化 zsh 的配置，离不开这玩意儿
- `zsh-theme-powerlevel9k` Powerline 主题
- `autojump` 不用再 cd 一长串进目录啦
- `zsh-autosuggestion` 命令自动补全
- `zsh-syntax-highlighting` 命令行语法高亮
- `fzf` 确实是模糊搜索神器
- `trash-cli` 直接 rm 是坏文明，最少也要 `alias rm="rm -iv"`
- `thefuck` 命令打错了？fuck 一下解解压
- `python-lolcat` 要 lolcat 不要 Ruby


## 触摸板手势

习惯了 Windows 上四指下划显示桌面，Linux 上也设置一下。

安装 `libinput-gestures` 触摸板手势支持：

```bash
yay -S libinput-gestures
sudo gpasswd -a $USER input
libinput-gestures-setup start
cp /etc/libinput-gestures.conf ~/.config/libinput-gestures.conf
```

编辑配置文件：

```bash
vim ~/.config/libinput-gestures.conf
```
```
# 四指上划下划，Super+D 我在 GNOME 中设置了「显示隐藏所有窗口」快捷键
gesture swipe up 4 xdotool key super+d
gesture swipe down 4 xdotool key super+d

# 双指缩放，实际体验效果并不好
gesture pinch in 2 xdotool key ctrl+minus
gesture pinch out 2 xdotool key ctrl+plus
```

重新启动并设置自动启动：

```bash
libinput-gestures-setup restart
libinput-gestures-setup autostart
```

## 鼠标滚轮速度

默认情况下鼠标滚轮速度太慢了，调快一点。安装 imwheel：

```bash
yay -S imwheel
```

配置（最后的 3 就是 3 倍速度）：

```bash
vim ~/.imwheelrc
```
```
".*"
None,      Up,   Button4, 3
None,      Down, Button5, 3
```

启动：

```bash
imwheel
```

可以正常使用的话参见 [Arch Wiki 添加启动项](https://wiki.archlinux.org/index.php/IMWheel#Run_IMWheel_on_startup)。

不知道是不是实现原理的关系，imwheel 运行之后触摸板滚动会变得很奇怪……按需使用吧。

## 笔记本合盖行为

一般来说默认就够用了，外接显示器时合盖也不挂起（睡眠）：

```bash
sudo vim /etc/systemd/logind.conf
```
```
HandleLidSwitch=suspend
HandleLidSwitchExternalPower=suspend
HandleLidSwitchDocked=ignore
```

如果只是想要合盖不挂起的话，GNOME Tweaks 里也可以设置，注意不要重复设置了。

## 杂项配置

图形界面用中文，命令行界面用英文。在 `~/.zshrc` 中添加：

```bash
export LANG=en_US.utf8
export LC_TIME=en_US.UTF-8
```

但是这样的话在终端中程序时打开的界面也会是英文，如果想用中文界面的话可以设置一下 alias：

```bash
alias typora="LANG=zh_CN.UTF-8 typora"
alias code="LANG=zh_CN.UTF-8 code"
```

修改 home 中的中文目录名称为英文（`~/图片` 修改成 `~/Pictures`）：

```bash
export LANG=en_US.utf8
xdg-user-dirs-gtk-update
```

也可以手动修改：

```bash
vim ~/.config/user-dirs.dirs
```
```bash
XDG_DESKTOP_DIR="$HOME/Desktop"
XDG_DOWNLOAD_DIR="$HOME/Downloads"
XDG_TEMPLATES_DIR="$HOME/Templates"
XDG_PUBLICSHARE_DIR="$HOME/Public"
XDG_DOCUMENTS_DIR="$HOME/Documents"
XDG_MUSIC_DIR="$HOME/Music"
XDG_PICTURES_DIR="$HOME/Pictures"
XDG_VIDEOS_DIR="$HOME/Videos"
```

移除 Manjaro 自带的浏览器设置包（会修改主页添加书签等）：

```bash
sudo pacman -R manjaro-browser-settings
```

## Win10 双系统

虽然 Manjaro 很好用，但有时候某些东西只能在 Windows 下跑，还是装个双系统备用吧。

注意：后文均以 UEFI + GPT 为例。（我寻思这年头 Legacy BIOS + MBR 的选手应该也没多少了）

### 备份 Linux

虽然基本不会出什么问题，不过为了以防万一还是全盘备份一下。

Manjaro 预装了 Timeshift 备份工具，使用起来很方便，我在移动硬盘上分了一个 ext4 来存放系统备份。当然你也可以[手动 rsync](https://wiki.archlinux.org/index.php/Rsync#Full_system_backup) 或者用其他你喜欢的备份方式。

### 硬盘分区

分一块 NTFS 出来给 Windows 安装就行了，用 GParted 还是什么随你。

```plain
[printempw@magicbook ~]$ lsblk
NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
nvme0n1     259:0    0   477G  0 disk
├─nvme0n1p1 259:1    0   300M  0 part /boot/efi
├─nvme0n1p2 259:2    0    50G  0 part /
├─nvme0n1p3 259:3    0   200G  0 part /home
├─nvme0n1p4 259:4    0     8G  0 part [SWAP]
└─nvme0n1p5 259:5    0 218.7G  0 part
```

### 安装 Windows

Rufus 制作 Windows 安装启动盘，安装至分好的 NTFS 分区一路无脑 Next。

### 修复引导

不出意外 Windows 就装好了，然后你会发现你进不去 Manjaro 了 —— 开机直接进 Windows。这是因为安装了 Windows 之后它会修改 UEFI 引导顺序，优先引导 Windows Boot Manager。而 Windows Boot Manager 不能引导 Linux，所以你就进不去系统了。但是你的 Linux 文件什么的都还在，不要慌。

这里先给出解决方法。

开机按 F12 键打开 UEFI 引导菜单，除了最上面的 Windows Boot Manager 之外应该还有一个启动项（不知道为什么我的机器上不显示其他启动项的名字……），选择它应该就可以进入 Manjaro 系统了：

![uefi-boot-menu-f12](https://img.blessing.studio/images/2019/11/23/uefi-boot-menu-f12.png)

如果你愿意，可以一直像这样通过 UEFI 引导菜单来启动双系统（事实上这也是现在的主流做法）。

不过我们的主力系统是 Manjaro，而且 Windows Boot Manager 又不能引导 Linux，所以还是把默认启动项改回我们熟悉的 GRUB 更好。

UEFI 启动序列可以直接在 Windows 下使用 BOOTICE 编辑：

![uefi-boot-entries-after-win10-installation](https://img.blessing.studio/images/2019/11/23/uefi-boot-entries-after-win10-installation.png)

也可以在 Linux 下通过 `efibootmgr` 来编辑：

```plain
[printempw@magicbook ~]$ efibootmgr
BootCurrent: 0001
Timeout: 0 seconds
BootOrder: 0000,0001,2001,0003,2002,2003
Boot0000* Manjaro
Boot0001* rEFInd Boot Manager
Boot0003* Windows Boot Manager
Boot2001* EFI USB Device
Boot2002* EFI DVD/CDROM
Boot2003* EFI Network

[printempw@magicbook ~]$ sudo efibootmgr --bootorder 0000,2001,0001,0003,2002,2003
BootCurrent: 0000
Timeout: 0 seconds
BootOrder: 0000,2001,0001,0003,2002,2003
Boot0000* Manjaro
Boot0001* rEFInd Boot Manager
Boot0003* Windows Boot Manager
Boot2001* EFI USB Device
Boot2002* EFI DVD/CDROM
Boot2003* EFI Network
```

更新一下 GRUB 让它可以引导 Windows：

```bash
sudo update-grub
```

![grub-win10-dual-boot](https://img.blessing.studio/images/2019/11/23/grub-win10-dual-boot.png)

> 如果想要 `update-grub` 不自动检测其他操作系统的启动项，可以这样运行：`sudo GRUB_DISABLE_OS_PROBER=true update-grub`。永久禁止检测需编辑 `/etc/default/grub`。

### 一些扩展知识

知其然，还要知其所以然。为什么这样就能修复引导呢？

在开始之前，先来了解一下 UEFI 引导操作系统的一些基础知识。

> 简单来说就是，EFI 相当于开机后运行的一个小型嵌入式系统，该系统的作用就是检查并启动我们需要的目标操作系统。EFI 的内部引导管理器管理着一个所有引导项的列表。可在开机加电后按 F12 键打开引导设备管理器查看列表。设置了默认启动项之后，开机 EFI 做相应检查后就直接交接给该默认启动项，比如 Windows 启动管理器或者 GRUB 启动菜单。在 Linux 上还可以通过命令行应用 `efibootmgr` 来访问和有限操作 EFI 内部引导管理器。
>
> 安装操作系统的时候系统需要为自己准备加载项，都需要将系统引导工具（或叫「引导加载器(boot loader)」如 Windows 启动管理器和 Grub 2 启动加载器）安装到 EFI 分区（ESP）。默认情况下，Windows 和 openSUSE 分别是 `/EFI/Microsoft/Boot/BCD.efi` 和 `/EFI/opensuse/grubx64.efi` (启用 Secure Boot 的话则是 `shim.efi`)。安装完了之后还需要向 EFI 注册成为内部引导管理器中的一个引导项后才会被 EFI 在用户开机后按 F12 键时展示给用户。如果设为默认，EFI 则会直接将后续的引导权交给该默认启动项而不会展示所有启动项列表。
>
> *引用自：[恢复 UEFI 模式的 GRUB2 启动项 | 水景一页](https://cnzhx.net/blog/restore-grub2-boot-menu-with-uefi/)*

理解了这个，就可以理解上面我们为什么要那么做了。

先来看看 EFI 分区里面都有啥：

```plain
[printempw@magicbook ~]$ sudo tree -L 3 /boot/efi
/boot/efi
├── EFI
│   ├── boot
│   │   └── bootx64.efi
│   ├── Insyde
│   ├── Manjaro
│   │   └── grubx64.efi
│   ├── Microsoft
│   │   ├── Boot
│   │   └── Recovery
│   ├── refind
│   │   ├── BOOT.CSV
│   │   ├── drivers_x64
│   │   ├── icons
│   │   ├── keys
│   │   ├── refind.conf
│   │   ├── refind_x64.efi
│   │   └── themes
│   ├── tools
│   └── UpdateCapsule
└── System Volume Information
```

安装完 Windows 之后，它会向 EFI 注册一个引导项，告诉 EFI 从哪块硬盘、哪个分区、哪个 `.efi` 文件引导系统（比如我的机器上就是 <code style="word-break: break-word;">Windows Boot Manager  HD(1,GPT,{UUID},0x1000,0x96000)/File(\EFI\Microsoft\Boot\bootmgfw.efi)</code>），然后把这个引导项的优先级设置成最高。这样一来默认情况下就是开机直接进 Windows 了，也就是我们碰到的情况。

不过我们之前安装 Manjaro 的时候，也向 EFI 注册了一个引导项（<code style="word-break: break-word;">Manjaro	HD(1,GPT,{UUID},0x1000,0x96000)/File(\EFI\Manjaro\grubx64.efi)</code>）。Windows 再怎么流氓也不会把我们已经添加了的引导项给删掉，所以按 F12 选择原来的引导项之后还是可以进去 Manjaro 的。

如果你继续安装其他的系统或者引导器（比如说我安装了 rEFInd），就会在 `EFI` 目录里继续添加文件，然后注册引导项，显示在 F12 UEFI 启动菜单中供用户选择。

这样一来是不是就能理解了呢？

## 双系统时间不同步

这也是老生常谈的问题了，Linux 认为硬件时钟是 UTC 的，而 Windows 认为硬件时钟是本地时区的。

所以解决方法也有两种，一种是让 Linux 认为硬件时钟是本地时间：打开 Manjaro Settings Manager，在「时间和日期」中勾选「本地时区的硬件时钟」。

![manjaro-settings-manager-set-local-rtc](https://img.blessing.studio/images/2019/11/23/manjaro-settings-manager-set-local-rtc.png)

> 吐个槽：就拿这个界面举例说吧，不知道为什么明明 Kvantum 中设置了 Yaru 主题，QT 程序的标题栏却是亮色风格的，而标题栏里的文本又是白色，很怪。GNOME Tweaks 中设置应用程序主题为 Yaru-dark 或者 Yaru-light 时都正常，设置成 Yaru 时 QT 程序的标题栏就变成缝合怪了，搞不懂。

另一种是让 Windows 认为硬件时钟是 UTC，修改一下注册表即可：

```
reg add "HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\TimeZoneInformation" /v RealTimeIsUniversal /d 1 /t REG_QWORD /f
```

反正两边同步就行，我选择了后者。

## 双系统共用蓝牙设备

网上教程很多，不再赘述。

## MagicBook 的一些坑

另外说一下 MagicBook 锐龙版在 Linux 下的坑。

首先就是这块 WLAN 蓝牙二合一无线网卡 Realtek 8822CE。i5 版的机器好像是配的 Intel 的无线网卡，锐龙版的就变成螃蟹家的了。WLAN 的话 5.2 以后的内核自带驱动，所以 Manjaro 上使用起来没什么问题，但蓝牙目前还是无法驱动。

好笑的是，机器预装的 Deepin Linux 专业版还是用的 5.0 内核，虽然预装版本的系统里也有预装驱动，但如果你重装一下 Deepin，[就会惊喜地发现无线网卡用不了啦](https://github.com/linuxdeepin/internal-discussion/issues/2425)。蓝牙无法使用的问题华为官方倒是也 [更新了 Linux 驱动](https://cn.ui.vmall.com/thread-21831568-1-1.html)，然而所谓的更新就是提供了个编译好的 .ko 文件，还只适配 Deepin 的 5.0.0-13-generic 内核，服了。好在这本子可以换网卡，实在不行就只能拆机换块 Intel 的无线网卡了。

顺带一提这网卡在 Windows 下也是无法免驱的，用原版 Windows 镜像安装的同学记得准备驱动。京东上买预装 Linux 版的 MagicBook 官方还会送个傻瓜式装 Windows 的 U 盘（真的傻瓜式，启动就开始安装，差点把我硬盘整个格掉），可以从里面直接获取需要的驱动程序。

另外还有指纹识别目前也无法驱动（`ID 27c6:5117 Shenzhen Goodix Technology Co.,Ltd. Goodix Fingerprint Device`），不知道什么时候能支持。Windows Hello 的指纹识别体验确实很不错。

其他基本上没什么问题了，用得很满意，毕竟这价格还要啥自行车是吧。

> 更新：就算在 Windows 下有驱动，MagicBook 锐龙版在同时使用蓝牙与 2.4GHz WiFi 的时候网络丢包也非常严重。此问题并非个例，华为论坛上也是一片骂声。虽然可以通过拆机更换无线网卡解决，不过有意愿购买的还是再考虑一下吧。
>
> 再次更新：我已经拆机更换 Intel AX200 网卡了，再您🐴的见。

## 参考链接

- [pacman - ArchWiki](https://wiki.archlinux.org/index.php/Pacman)
- [HiDPI - ArchWiki](https://wiki.archlinux.org/index.php/HiDPI)
- [Fcitx - ArchWiki](https://wiki.archlinux.org/index.php/Fcitx)
- [System time - ArchWiki](https://wiki.archlinux.org/index.php/System_time)
- [[HowTo] Dual-boot Manjaro - Windows 10 - Step by Step](https://forum.manjaro.org/t/howto-dual-boot-manjaro-windows-10-step-by-step/52668)
- [Using livecd v17.0.1 (and above) as grub to boot OS with broken bootloader](https://forum.manjaro.org/t/using-livecd-v17-0-1-and-above-as-grub-to-boot-os-with-broken-bootloader/24916)
- [恢复 UEFI 模式的 GRUB2 启动项](https://cnzhx.net/blog/restore-grub2-boot-menu-with-uefi/)
- [Arch Linux (Manjaro) 配置与常用软件安装指南](https://blog.kaaass.net/archives/1205)
- [关于 Windows Boot Manager、Bootmgfw.efi、Bootx64.efi、bcdboot.exe 的详解](http://bbs.wuyou.net/forum.php?mod=viewthread&tid=303679)
