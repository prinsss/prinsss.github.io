---
title: 'Python 实现自动重命名网易云音乐下载文件'
date: '2016-07-23 16:40:00'
updated: '2016-07-23 17:02:01'
categories: 技术
tags:
  - Python
  - 音视频
---

网易云音乐 PC 版的下载文件都是按照 `歌手名 - 歌曲名.mp3` 的格式命名的，然而我比较喜欢直接以歌曲名作为文件名。手动一个一个文件改肯定是不行的，太 tm 蠢了（笑

以前我是用 shell 写的脚本来实现自动重命名的，但是有一次需要处理一张 OST 内的所有歌曲时（Rabi-Ribi 的 OST，我想把所有的文件名前面加上音轨号），shell 脚本就有些力不从心了，而且我也不想去折腾 shell 读取 ID3，就打算用 Python 来实现。

不得不说 Python 用来写这种小脚本真的是贼 tm 方便，加上查 Mutagen 文档的时间写了也就半个小时：

<!--more-->

```python
# -*- coding: utf-8 -*-
# @Author: prpr
# @Date:   2016-06-26 21:40:01
# @Last Modified by:   prpr
# @Last Modified time: 2016-07-23 16:38:06

import os
# from mutagen.mp3 import MP3
# import mutagen.id3
# from mutagen.easyid3 import EasyID3

path = r"C:\Users\prpr\Desktop\CloudMusic"

for fname in os.listdir(path):
    if (fname[-3:] == "mp3"):
        finfo = fname.split(' - ')

        # if filename does not contain the divider
        if (finfo[0][-3:] == "mp3"):
            new_fname = finfo[0]
        else:
            new_fname = finfo[1]

        old_path = "%s/%s" % (path, fname)

        # id3info = MP3(old_path, ID3=EasyID3)
        # print(id3info.items())

        # for k, v in id3info.items():
        #     if (k == "tracknumber"):
        #         tracknumber = v[0]

        # new_fname = tracknumber + " " + finfo[1]

        new_path = "%s/%s" % (path, new_fname)

        os.rename(old_path, new_path)

        print(new_fname)

print("Done.")
```

被注释掉的地方是我用来处理 OST 的，其他地方可以直接把网易云下载的文件重命名为 `歌曲名.mp3` 格式。

------------

效果：

![before](https://ooo.0o0.ooo/2016/07/23/57933156d6915.png)

↓

![after](https://ooo.0o0.ooo/2016/07/23/57933157d1c20.png)

------------

话说我最近真是越来越懒了，啥都想搞个自动化，上次学校叫确认学分，将近 50 项要一个一个点过去简直反人类 |д\` ) 于是我就用 `$('a:contains("确认")').each()` 写了个自动确认脚本。脚本本身倒是没啥大不了的，不如说我比较惊讶的是教育局网站竟然用了 jQuery 和 ajax（笑）

最近在折腾以 gulp 为核心的前端自动化，还是蛮有意思的，[Blessing Skin Server](https://github.com/prinsss/blessing-skin-server) V3 也用了很多最近流行的前端技术~~（我的试验田）~~，有兴趣的话给个 Star 吧~
