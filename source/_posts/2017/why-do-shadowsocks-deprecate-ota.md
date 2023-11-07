---
title: '为何 shadowsocks 要弃用一次性验证 (OTA)'
date: '2017-02-09 19:18:00'
updated: '2017-05-14 13:37:42'
categories: 技术
tags:
  - GFW
  - 分享
---

前些天，shadowsocks 提出了 SIP004 草案，旨在使用 `AEAD 算法` 取代原先的不安全的 `流加密 + OTA`，并弃用了一次性验证 (OTA)。

新协议的提出对于 shadowsocks 是一个非常非常重大的改进，因此我写了这篇博文为看不懂洋文的<span title="pong">朋</span>友们科普一下「为什么 OTA 会被这么快被弃用」以及「为什么应该使用新协议」。

<!--more-->

## 一、OTA 是什么

OTA（One Time Auth，[一次性验证](https://shadowsocks.org/en/spec/one-time-auth.html)），是之前 shadowsocks 为了增强安全性，抵抗 CCA（Chosen-ciphertext Attack，[选择密文攻击](https://zh.wikipedia.org/wiki/%E9%80%89%E6%8B%A9%E5%AF%86%E6%96%87%E6%94%BB%E5%87%BB)）而加入的实验性功能。

我觉得应该很多人都听过这玩意 —— 就算不知道 OTA 是啥好歹也在 shadowsocks 各分支的客户端上看到过「一次性验证」的开关吧？虽然这个名字确实起得有点让人不明所以就是了（笑）。

那么下面我来科普下当初为什么要加入 OTA 功能。

## 二、原协议的弱点

原 shadowsocks 协议的这个漏洞其实早在 2015 年就被 [@breakwa11](https://github.com/breakwa11) 提出了。当时正值 @clowwindy [被喝茶](https://prinsss.github.io/about-clowwindy-archive/)之际，此 issue 下闹得沸沸扬扬撕逼不断，过了好一段时间后才开始有正经的技术讨论。

如果你想要了解一下当时的情况可以去看看 [这个 issue](https://github.com/breakwa11/shadowsocks-rss/issues/38)，我这里简略概括一下当时提出的漏洞。

### 2.1 shadowsocks 协议

[原 shadowsocks 协议](https://shadowsocks.org/en/spec/protocol.html) 的 TCP 握手包（加密后）的格式是这样的：

```text
+-------+----------+
|  IV   | Payload  |
+-------+----------+
| Fixed | Variable |
+-------+----------+
```

其中的 IV（Initialization Vector, [初始化向量](https://zh.wikipedia.org/wiki/%E5%88%9D%E5%A7%8B%E5%90%91%E9%87%8F)）是使用随机数生成器生成的一个固定长度的输入值。通过引入 `IV` 能够使相同的明文和相同的密钥产生不同的密文，让攻击者难以对同一把密钥的密文进行破解。

shadowsocks 服务端会用这个 `IV` 和 `pre-shared key`（预共享密钥，通常是用户设置的密码）来解密 TCP 数据包中的 `payload`。

解密后的内容格式如下：

```text
+--------------+---------------------+------------------+----------+
| Address Type | Destination Address | Destination Port |   Data   |
+--------------+---------------------+------------------+----------+
|      1       |       Variable      |         2        | Variable |
+--------------+---------------------+------------------+----------+
```

其中 `Address Type` (ATYP) 是地址类型，占一个字节，有三个可能的取值：`01`, `03`, `04`，分别对应 `IPv4`, `hostname`, `IPv6` 类型的地址。这些都是 [RFC1928](https://www.ietf.org/rfc/rfc1928.txt) 中定义的标准，有兴趣可以去看看。

握手完成后 shadowsocks 中继就会工作在流模式下，后续的所有 TCP 数据包不会再带上 `IV`，而是使用握手时协商的那个 `IV`。

说完了原 shadowsocks 协议的内容，下面说说该协议的不足之处。

### 2.2 原协议的缺陷

正如上表所示，原始 shadowsocks 协议 TCP 握手包中的 `IV` 字段是 Fixed（定长）的。不同的加密算法 `IV` 长度不同，对于 `rc4-md5` 和 `aes` 系列等常用算法，这个长度是 `16` 字节。各加密算法的详细信息可以在 [官方文档 - Cipher](https://shadowsocks.org/en/spec/cipher.html) 查看。

而服务端为了判断数据是否有效，会检查数据包中表示地址信息的那个字节，看它是不是上面提到的三个可能取值。**如果是，就尝试解析后面的地址和端口进行连接；如果不是，立即断开连接。**

正是 shadowsocks 服务器的这个行为使得主动探测成为可能。

#### 2.2.1 主动探测的原理

> 该方法由 @breakwa11 [提供](https://github.com/breakwa11/shadowsocks-rss/issues/50)

一般来讲，「表示地址类型的那个字节」是被加密后发送的，所以第三方无法精确的修改它。**但是不巧的是**，shadowsocks 所有的加密方式都是 `stream cipher`（[流加密](https://zh.wikipedia.org/wiki/%E6%B5%81%E5%8A%A0%E5%AF%86)），而这种加密方式的特点就是**「明文数据流与密钥数据流一一对应」**。

通俗地讲，即对应修改了某个位置的密文（根据加密模式的不同，可能影响到后面其他密文块的解密，也可能影响不到，但在这里这个性质并不重要），如果预先知道了明文的模式，虽然无法解密还原出内容，但可以修改密文中的特定字节，起到修改**解密后的明文**的效果。

根据流加密的这个特性，坏东西们就可以通过伪造 TCP 数据包来主动探测 shadowsocks 服务器了。攻击者只要暴力尝试修改加密后的数据包中 `IV` 之后紧接着的那个字节（如果使用的加密算法 `IV` 长度为 16 字节，那么就修改第 17 个字节），穷举 `2^8 = 256` 种可能性，**如果被测试的服务器有一种到三种情况下没有立即关闭连接**，就可以判断出这台机子的这个端口开放的是 shadowsocks 服务。

或许这种主动探测方法正在被 GFW 大规模应用，谁知道呢？你正在使用的原版 shadowsocks 代理随时有可能被封锁。

#### 2.2.2 防范主动探测

经过讨论后上述漏洞被证明是 [确实存在](https://github.com/breakwa11/shadowsocks-rss/issues/38#issuecomment-136022971) 的，所以现在大部分的 shadowsocks 分支都已经加入了针对这种探测方法的对抗措施（e.g. [shadowsocks-libev v2.5.5+](https://github.com/shadowsocks/shadowsocks-libev/compare/v2.5.4...v2.5.5)），即「随机超时抵抗」而不是立即断开连接，配合自动黑名单等机制可以有效减少被探测到的风险。

但是这种方法总归不是长久之计，要怎么办呢？ ![](https://img.prin.studio/images/2017/02/09/QQ20170209163228.jpg)

## 三、OTA 闪亮登场

上述情况下主动探测能够得逞的原因是**服务器没有对收到的数据包进行校验**，随便哪个阿猫阿狗发来的数据包，不管有没有被恶意篡改过，原来的 shadowsocks 服务器都会做出同样的反应。

这时 [@madeye](https://github.com/madeye)（现在的 shadowsocks 维护者）提出了 One Time Auth 即「一次性验证」的提案，给原 shadowsocks 协议加上了数据包验证。

### 3.1 OTA 协议

开启了 OTA 后的 shadowsocks 握手包（加密前）是这样的：

```text
+------+---------------------+------------------+-----------+
| ATYP | Destination Address | Destination Port | HMAC-SHA1 |
+------+---------------------+------------------+-----------+
|  1   |       Variable      |         2        |    10     |
+------+---------------------+------------------+-----------+
```

可以看到它添加了一个 `HMAC-SHA1` 字段，这个字段是将除了 `DATA` 通过 `HMAC-SHA1` 算法（以 `IV + PSK` 作为 key）生成的。并且数据包头部的 ATYP 添加了一个标志位用于指示 OTA 是否开启（`ATYP & 0x10 == 0x10`）。

```text
+----------+-----------+----------+----
| DATA.LEN | HMAC-SHA1 |   DATA   | ...
+----------+-----------+----------+----
|     2    |     10    | Variable | ...
+----------+-----------+----------+----
```

握手完成后，接下来的 TCP 数据包均在原始协议的包上添加了 `DATA.LEN`（包长度）和 `HMAC-SHA1` 字段。这样，服务器就可以对数据包进行完整性校验，也就可以识别出被篡改过的数据包了。

### 3.2 OTA 的缺陷

OTA 增强了安全性，可以防范 CCA，也解决了原版协议数据包容易被篡改的问题，听起来很美好，不是吗？

**但是**，对于这个协议的实现，shadowsocks-libev 及其它大部分分支均假定第一个数据包必须包含整个带了 `SHA1-MAC` 的头部，否则断开连接。

OK，又一个可以通过服务器行为进行主动探测的地方。不过这种主动探测也可以通过上面提到的「随机超时抵抗」来进行防范，真正可怕的在下面：

> 该方法由 @breakwa11 提供

还记得我们上面提到的 `stream cipher`（流加密）的特点吗？攻击者可是使用同样的套路修改数据包中的 `DATA.LEN` 字段，然后通过观察服务器的反应来判断这是否是一个 shadowsocks 服务器。

举个栗子，如果攻击者恶意构造 `DATA.LEN` 的高位字节密文，使得解密后 `DATA.LEN` 的数值变得特别大（但是后面的 `DATA` 的大小并没有改变），shadowsocks 服务器就会继续等待那些实际上**并不存在**的数据传输完成直到超时。因此只要在发送恶意数据包后观察服务器是不是「不会断开连接且至少等待 1 分钟无任何数据包」即可确定该服务器是否开启了 shadowsocks 服务。

没错，这样的检测方法比检测原版协议还要神不知鬼不觉，甚至不会在服务端留下任何可疑的痕迹。OTA 当初是为了给原版协议的流加密加上一个认证以增强安全性，殊不知这带来了更大的隐患，这也是为什么 shadowsocks-org 要急急忙忙弃用 OTA 的原因。

## 四、新协议 AEAD

### 4.1 之前协议的缺陷汇总分析

原版 shadowsocks 协议最大的缺陷就是未对数据包完整性进行校验，再加上流加密的特点，导致了攻击者可以通过穷举的方式修改密文进行基于服务器行为的主动探测。

OTA 协议虽然通过在数据包尾部附上 `HMAC-SHA1` 字段对 `DATA` 的完整性进行了验证，但是包首部的 `DATA.LEN` 用于计算偏移的指示 `DATA` 长度的字段**并没有经过验证**。这导致了攻击者可以通过构建高位的 `DATA.LEN` 密文进行**更隐蔽**的主动探测。

因此，在这次新协议草案的讨论过程中[参照了](https://github.com/shadowsocks/shadowsocks-org/issues/30#issue-200289203) shadowsocksR 协议的一个重要改进 —— 对 `DATA.LEN` 进行单独校验，参见：[ShadowsocksR 协议插件文档](https://github.com/breakwa11/shadowsocks-rss/blob/master/ssr.md)。

### 4.2 AEAD 是啥

在通常的密码学应用中，Confidentiality（保密）用加密实现，消息认证用 MAC（Message Authentication Code，消息验证码）实现。这两种算法的配合方式，引发了很多安全漏洞，过去曾经有 3 种方法：

1. Encrypt-and-MAC (E&M)
2. MAC-then-Encrypt (MtE) <- 即 OTA 的做法
3. Encrypt-then-MAC (EtM) <- 新协议的做法

然而后来人们发现，`E&M` 和 `MtE` 都是有安全问题的，所以 2008 年起， 逐渐提出了「用一个算法在内部同时实现加密和认证」的 idea，称为 [AEAD (Authenticated Encryption with Associated Data)](https://en.wikipedia.org/wiki/Authenticated_encryption)。在 AEAD 这种概念里，`cipher + MAC` 的模式被**一个** AEAD 算法替换。

使用了 AEAD 算法的新协议本质上就是更完善的 `stream cipher + authentication`，虽然它依然使用的是流加密，但是通过更完善的**数据包完整性验证**机制杜绝了上面所述的可被篡改密文的可能性。

> 注：截至本文发布时新协议都是使用的 `流加密 + 认证`，不过 AEAD 的设计使得它能够使用块加密，因此上面说的并不是绝对的。

而为了实现认证加密（Authenticated Encryption），新协议必须要将 TCP 流分割成不同的 chunk 并分别验证。如对新协议的数据包定义有兴趣可以查阅 [官方文档 - AEAD](https://shadowsocks.org/en/spec/AEAD.html)，本文不再深入。

### 4.3 新协议支持的 AEAD 算法

目前 shadowsocks-libev [已经支持](https://github.com/shadowsocks/shadowsocks-libev/releases/tag/v3.0.0) 如下的 AEAD 算法，其他分支也正在跟进中：

- AES-128-GCM
- AES-192-GCM
- AES-256-GCM
- ChaCha20-IETF-Poly1305
- XChaCha20-IETF-Poly1305

这些新的加密算法本质上就是 `流加密 + 验证`，原先的其他单纯的流加密算法均不适用于新协议。

### 4.4 新协议的优缺点

使用了 AEAD 算法的新协议能够解决上面描述的 Original/OTA 协议的所有问题，可以有效防范 CCA 和中间人攻击，减少被主动探测的风险。我能想到的唯一的缺点大概就是性能了，但是它又能影响多少呢？Benchmark 参考在 [这里](https://github.com/shadowsocks/shadowsocks-libev/issues/1173)。

shadowsocks 原本就不是为「加速网络」而生的项目，它的初衷是「突破网络审查并提供安全的加密访问」。是继续使用很可能会被 GFW 封锁的原协议呢，还是选择使用更安全的新协议呢，相信各位看官心中自有定夺 ![](https://img.prin.studio/images/2017/02/09/QQ20170209164340.gif)

## 五、写在后面

写这篇文章之前我对密码学的了解也就是一点皮毛程度而已，所以这篇文章也是我边查资料边写出来的。为了不让自己误人子弟，我非常谨慎查阅了相关资料并向他人请教（衷心感谢 @breakwa11 和 @madeye 对本文的审阅和提出的建议！）

但是所谓「金无足赤，人无完人」，如果文章中仍有什么错误的地方，欢迎在下方评论区批评指正。

> 大家都不容易，谨以此文敦促 shadowsocks 用户 / 开发者们尽快使用 / 支持新协议。

## 六、参考链接

- [SIP004 - Support for AEADs implemented by large libraries](https://github.com/shadowsocks/shadowsocks-org/issues/30)
- [Shadowsocks - One Time Auth](https://shadowsocks.org/en/spec/one-time-auth.html)
- [ShadowSocks 协议的弱点分析和改进](https://github.com/breakwa11/shadowsocks-rss/issues/38)
- [Shadowsocks 各分支的安全性](https://breakwa11.blogspot.com/2016/09/shadowsocks.html)
- [Deprecate stream ciphers with insufficient IV length](https://github.com/shadowsocks/shadowsocks-org/issues/36)
- [现代密码学实践指南 - 名词解释](https://www.kancloud.cn/digest/modern-crypto/79572)
- [分组密码工作模式](https://zh.wikipedia.org/zh-cn/%E5%88%86%E7%BB%84%E5%AF%86%E7%A0%81%E5%B7%A5%E4%BD%9C%E6%A8%A1%E5%BC%8F)
- [Streaming API to authenticated encryption](http://crypto.stackexchange.com/questions/6008/streaming-api-to-authenticated-encryption)






