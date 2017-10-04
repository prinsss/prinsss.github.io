---
title: '使用 ffmpeg 拼接 bilibili 客户端所下载的分段 flv 视频'
date: '2017-05-13 20:48:50'
updated: '2017-05-13 21:48:21'
categories: 技术
tags:
  - Shell
---

唉，我现在用的这破手机播 1080P 视频要掉帧，只好在电脑上看，说不出话。

### 缘起

前些天我关注的某 [气人主播](http://space.bilibili.com/15810/#!/) 在 bilibili 上传了《盗贼之海》（*Sea of Thieves*）Alpha 测试的直播录像，却因吃了文化亏不慎违反了保密协定，不久视频就被不存在了。不过好在有热心猛男把缓存好了的睾清视频发了出来，像我这样没赶上趟的人才能爽到 :P

![感谢这位pong友](https://img.blessing.studio/images/2017/05/13/20170513185210.png)

然而这位pong友上传的是 bilibili 客户端的下载（缓存）格式，虽然放在手机的 `/Android/data/tv.danmaku.bili/download` 目录下就可以被客户端直接识别，但是想要在电脑上直接播放就没那么容易了。

<!--more-->

我们先来看看 B 站客户端下载内容的目录结构：

```text
10034455（视频 AV 号）
├── 1（视频的各分 P）
│   ├── danmaku.xml（弹幕文件）
│   ├── entry.json（单 Part 信息、标题等等）
│   └── lua.flv.bili2api.3（分段视频，一段差不多六分钟）
│       ├── 0.blv（就是改了后缀的 flv 文件）
│       ├── 0.blv.4m.sum（校验码）
│       ├── 1.blv
│       ├── 1.blv.4m.sum
│       ├── 2.blv
│       ├── 2.blv.4m.sum
│       └── index.json（储存分段信息）
├── 2
└── 3
```

可以看到目录的结构还是比较清晰的，一眼看过去就能懂个大概，也没有什么反人类的混淆机制。想要在电脑上观看的话，就必须把那些 `0.blv`、`1.blv` 之类的文件后缀先修改为 `.flv`，然后再把他们合并起来（不合并的话就无法在那些本地弹幕播放器中与弹幕文件时间轴对应了）。

不过作为一个搞技术的人，我自然是不可能去手动重命名 + 合并这些东西的，那太蠢了。这种无脑力气活就该让计算机来帮我们解决 ;)

### 需求

- 合并分段的 flv 文件到一个文件；
- 操作方便；
- 速度尽可能地快。

### 尝试

因为图方便，我先是在 Google 上找了一些视频合并的软件，包括「格式工厂」、「硕鼠合并」、「极速 FLV 合并器」、「BoilsoftVideoJoiner」等。经试用，硕鼠等大部分过久没有更新的软件都无法正确识别上述的 FLV 格式，导致合并失败，具体原因没有去深究。而格式工厂等软件似乎必须对所有分段视频进行转码后再合并（有损合并），即使那些视频的尺寸、音视频编码均相同。这也导致这些软件合并速度屌慢，不予考虑。

### 解决方案

最后还是决定用 `ffmpeg` 进行视频合并操作。不得不说，`ffmpeg` 这个养活了绝大多数国产视频处理软件的开源项目在视频处理方面确实是一把好手，Google 一下就找到了解决方案。

举个栗子，如果你有 这几个视频要合并：

`1.flv`、`2.flv`、`3.flv`

你只需要建立一个文本文件（e.g. `ff.txt`），在里面写上：

```
# 相对路径、绝对路径均可
file '/path/to/1.flv'
file '/path/to/2.flv'
file '/path/to/3.flv'
```

然后在 shell 中运行：

```bash
ffmpeg -f concat -i /path/to/ff.txt -c copy output.mp4

# 参数说明：
# -i 设定输入文件
# -f 设定编码器，这里使用 concat 无损合并
# -c 流选择器，这里选择所有流
# 最后可以选择任何可以封装的格式，不一定是 MP4
```

然后，就好了。合并速度差不多就是你硬盘的 I/O 速度。

题外话，在 Windows 上，`ffmpeg` 可以用 [Chocolatey](https://chocolatey.org/) 这个包管理器安装。直接在终端中运行 `$ choco install ffmpeg`，下载安装修改环境变量一步到位，突出一个爽到。

### 写个脚本

知道了原理，就可以动手写个自动化脚本了。这里我选择了 Bash 脚本语言，毕竟就这么点功能，几行就 OK。用 Bash 的话开个终端复制进去就可以直接运行，比起其他语言也方便 ~~（我才不会说是因为我 Python 都快忘光了呢）~~。

另外需要注意的是，有些视频的分段超过了 10 个文件，如果直接遍历的话会变成 `[1, 10, 2, 3...]` 这样的顺序，导致最后拼接出来的视频也变成这样，所以需要给单位数的分段先添个 `0`，这样就会是 `[01, 02 ... 10]` 的正常顺序了。

{% lazy_gist 1bc29da99b238d68e87af874f898f435 %}

这里是压缩过的单行版，方便复制：

```bash
cat /dev/null > ff.txt;for i in *.blv; do seq_num="${i%.blv}";if [ "${#seq_num}" -eq 1 ];then mv "$i" "0$seq_num.flv";else mv "$i" "$seq_num.flv";fi;done;for i in *.flv; do echo "file '${i}'" >> "ff.txt";done;ffmpeg -f concat -i ff.txt -c copy ../output.mp4;rm ff.txt;printf "success"
```

### 效果

![终端执行](https://ooo.0o0.ooo/2017/05/13/5916f998dd712.png)

![输出结果](https://img.blessing.studio/images/2017/05/13/QQ20170513201722.png)

合并过程大概六七秒吧，一发入魂非常到位。

将合并后的视频文件 `output.mp4` 和 `danmaku.xml` 弹幕文件一起拖入「弹弹 Play」或「BiliLocal」等本地弹幕播放器后就可以观看了，爽到。

![弹幕播放器](https://img.blessing.studio/images/2017/05/13/QQ20170513202429.png)

### 参考链接

- [和猫打交道——所有关于视频无损合并（主要是 H.264）的问题](https://www.cnbeining.com/2014/05/dealing-with-cat-all-on-video-non-destructive-merge-mainly-h-264-problem/)
- [使用 ffmpeg concat 分离器来更有效地拼接视频](https://github.com/soimort/you-get/issues/324)



