---
title:   'Android 集成开发环境搭建'
date:    '2015-06-20 03:40:17'
updated: '2015-08-29 00:46:44'
categories: 技术
tags:
  - Android
---

嘛，反正网上教程那么多，窝就随便写一些权当记录好了~

---------

### 首先，你需要 [JDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html)（Java Development Kit）7+

然后一路 next，安装后要配置环境变量：

计算机 -> 属性 -> 高级系统设置 -> 高级 -> 环境变量

- 系统变量 -> 新建 JAVA_HOME 变量 ，变量值填写jdk的安装目录  
 （窝是 `C:\Program Files\Java\jdk1.8.0_45`)
- 系统变量 -> 寻找 Path 变量→编辑，在变量值最后输入  
 `%JAVA_HOME%\bin;%JAVA_HOME%\jre\bin;`  
 （注意原来Path的变量值末尾有没有 `;` 号，如果没有，先输入 `;` 号再输入上面的代码）
- 系统变量 -> 新建 CLASSPATH 变量，变量值填写（注意最前面有一点）  
 `.;%JAVA_HOME%\lib;%JAVA_HOME%\lib\tools.jar`

环境变量配置完毕~ <!--more-->

### 第二步，下载 [Android Studio](http://developer.android.com/sdk/index.html)

可以选择 bundle 版（捆绑了Android SDK），或者 ide-only

ide-only 适用于已经安装 Android SDK 的，可以节省下载时间（900m -> 200m）

同样一路 next，顺带一提 AS 最新版是没有中文支持的哦~

不过你如果连安装都看不懂，还是放弃开发吧

### 第三步，配置 Android SDK

打开SDK manager，加载内容需要翻墙

选择需要的API版本，install~ 然后创建AVD之类的~

----------

よし、既然环境配置好了，那咱写个hello world吧 ![QQ图片20150606223914](https://img.blessing.studio/images/2015/06/2015-06-06_14-39-25.jpg)

![QQ截图20150619192227](https://img.blessing.studio/images/2015/06/2015-06-19_11-32-28-1024x620.png)

新建个project，让AS帮生成主活动，这些都和ADT一样 ![chabei](https://img.blessing.studio/images/2015/05/2015-05-24_09-07-51.png)

![QQ截图20150619193422](https://img.blessing.studio/images/2015/06/2015-06-19_11-37-09-1024x592.png)

AS自带的AVD可是比ASDK里的AVD manager高多了 ![i_f16](https://img.blessing.studio/images/2015/05/2015-05-24_09-19-27.png)

![QQ截图20150619193541](https://img.blessing.studio/images/2015/06/2015-06-19_11-36-31-1024x559.png)

写个布局~运行~ ![i_f16](https://img.blessing.studio/images/2015/05/2015-05-24_09-19-27.png)

![QQ截图20150619193613](https://img.blessing.studio/images/2015/06/2015-06-19_11-39-12.png)
