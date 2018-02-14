---
title: 又是一种 Minecraft 外置登录解决方案：自行实现 Yggdrasil API
date: 2017-08-08 23:28:32
updated: 2017-08-08 23:28:32
categories: 技术
tags: 
  - Minecraft
  - ACGN
  - PHP
  - 教程
---

最近给 Blessing Skin 写了个插件，利用皮肤站本身的账号系统实现了 Yggdrasil API（就是 Mojang 的登录 API），然后配合 [authlib-agent](https://github.com/to2mbn/authlib-agent/) 这个库将启动器（基于 Java 编写的支持正版登录的启动器都行）、Minecraft 游戏、Minecraft 服务端中的 Mojang Yggdrasil API 地址给替换成了自己实现的第三方 Yggdrasil API 地址（字节码替换），从而实现了与正版登录功能几乎完全相同的账户鉴权系统。

通俗地讲，就是我把 Mojang 的正版登录 API 给【劫持】成自己的啦，所以可以像登录正版那样直接用皮肤站的邮箱和密码登录游戏（还支持 Mojang 都不支持的多用户选择哦）。这种外置登录系统的实现应该可以说是比市面上的软件都要完善（毕竟可以直接利用 Minecraft 本身自带的鉴权模块），因此写一篇博文介绍一下这些实现之间的不同之处，顺带记录一下实现 Yggdrasil API 时踩到的坑，算是抛砖引玉了。

{% alert warning %}
**注意**：本文不适合小白及问题解决能力弱的人群阅读。
{% endalert %}

~~感觉我明明好久没玩 MC 了，要玩也都是玩正版服务器，但是却一直在搞这些盗版服用的东西，我真是舍己为人造福大众普惠众生啊（不~~

## 一、服务器内置登录插件

相信维护过 Minecraft 服务器（当然，我这边说的是运行在离线模式下的服务器）的腐竹们或多或少都听说过 Authme、CrazyLogin 等登录插件的鼎鼎大名吧。由于这些服务器运作在离线模式（`online-mode=false`，即俗称的盗版模式）下，缺少 Mojang 官方账户认证系统的支持，所以必须使用这类插件来进行玩家认证（否则随便谁都可以冒名顶替别人了，换一个登录角色名就行）。

这类插件的工作原理就是在服务端维护一个数据表，表中每一条记录中存储了角色的「角色名」、「登录密码」、「注册时间」、「登录 IP 地址」等等信息，当玩家初次进入服务器时需要通过这些插件进行注册操作（e.g. `/register` 命令）并在表中插入一条记录，注册完毕后进入服务器则需要输入密码（e.g. `/login <password>` 命令）来认证。

其实这样的解决方案也没什么不好，而且现在 Authme 等登录插件在众多的服务器中都还是主流。但是，如果你的服务器已经发展到比较大型了，或许你就比较希望有这样一个东西：

<!--more-->

- 可以直接在启动器中进行登录鉴权操作，点击「开始游戏」就可以直接进入服务器，不用在游戏里再一遍遍输入 `/login` 等指令；
- 有一个网页版的用户管理，可以直接对玩家进行操作（e.g. 封禁、修改积分）；
- 玩家们可以直接在一个直观的网页上注册账号，并且可以直接用这个账号 & 密码登录游戏；
- 希望这个账号系统还能对接论坛、皮肤站等乱七八糟的东西，玩家注册了一个账号之后，可以在任何地方使用；
- 希望服务器有一个自己的网页、自定义启动器、用户管理系统、卫星地图之类的东西来装逼；
- etc.

并不是所有腐竹都满足于 Authme + Discuz 这样的组合的（而且这类游戏内登录系统也有不少安全漏洞），毕竟在这个 Minecraft 多人联机服务器发展接近饱和的时候，如果想要你的服务器能够吸引新玩家，那么除了服务器本身建设之外的地方也是要好好考虑的。

## 二、外置登录系统

正是这样的需求催生了不少 Minecraft 的「外置登录插件」、「网页登录」等等软件（而且人气都挺高的），我随手在 MCBBS 上一搜就有很多类似的产品，用啥语言写的都有：*MadAuth、WebLogin、BeeLogin、WebRegister、冰棂登陆系统……*

这些软件的原理就是将原本的登录鉴权这一步骤从游戏里抽出来了，将其放到启动器 or 网页上去，而服务端插件的功能就只剩下「查询数据库中用户的登录状态，决定是否放行」：

![原理图](https://img.blessing.studio/images/2017/08/04/Minecraft.png)

*▲随手画的示意流程图，这里推荐一下  [ProcessOn](https://www.processon.com/) 这个在线作图网站，很好用 ;)*

似乎也挺好的，不是吗？那我今天要说的「自行实现 Yggdrasil API」方法，和这些现成的方式有什么不一样呢？

## 三、自行实现 Yggdrasil API

继续看下去之前，首先你要知道 Mojang 正版的 Minecraft 是怎样登录的。Mojang 专门定义了一个用于鉴权的 API，Mojang 旗下的游戏（Minecraft、Scrolls 等）都是用的这一套 API 来正版验证的 —— 这一套 API 的名字就叫做 Yggdrasil（即北欧神话里的世界树，~~这名字可真几把炫酷~~）。

正版登录的好处就不用我说了吧？再也不用担心假人压测、自带外置登录（启动器里账号密码登录）、自带皮肤加载（不需要安装 CSL、USM 等皮肤补丁了）、Tab 栏显示头像……可以说，Minecraft 自带的 Yggdrasil API 鉴权系统比上面的那些什么登录插件啊什么外置登录的功能强多了，所以正版服务器（`online_mode=true`）也不用担心那些破事，因为官方的这一套鉴权系统以及很完善了。

那么问题来了，盗版用户要怎样才能把 Mojang 为正版开发的 Yggdrasil API 系统拿来用呢？

### 3.1 基本原理

这里必须感谢 [to2mbn/authlib-agent](https://github.com/to2mbn/authlib-agent/) 这个项目，正是因为这个项目，我接下来描述的方法才成为可能。是的，方法很简单，Minecraft 虽然把 Mojang 官方的 Yggdrasil API 地址（`https://authserver.mojang.com`）给写死在源码里了，但是既然 Minecraft 是基于 JVM 的应用程序，我们就可以通过字节码替换的方法将官方的 API 地址替换成我们自己实现的 API 地址。

以下内容援引自 authlib-agent 的 wiki：

> authlib-agent 是一个高可靠性, 高适用性, 用于 Minecraft 的, 游戏外登录及皮肤解决方案. 支持 Minecraft1.7+, Craftbukkit, Spigot, Bungeecord 等. 通过对正版登录 API 的重定向, 实现了一个功能和正版几乎一样的游戏外登录系统.

不过既然要把官方 API 地址替换成我们自己的，我们就得自己实现一个和官方 API 其他地方都一样的 API，也就是，**仿造出一个第三方 Yggdrasil API 出来**。

### 3.2 解决方案

可以说这个系统中，就是「开发完整实现了 Yggdrasil API 的后端」这一步最难了。为啥捏？这个服务端不止要实现用户的认证、皮肤获取，你还得实现用户的注册、登录、角色管理、皮肤上传、皮肤库等等七七八八的功能吧？你还得给这些功能套上一个好看的界面吧，不然你让你的玩家怎么使用？你还得来个后台管理页面吧，不然管理员怎么进行用户管理、封禁等操作？

authlib-agent 官方也提供了一个 Java 编写的后端 [yggdrasil-backend](https://github.com/to2mbn/authlib-agent/tree/master/yggdrasil-backend)，虽然完整实现了 Yggdrasil API，但是它并没有提供直观的管理网页，只提供了一套 RESTful API，所以距离实装要求还是差得比较远的。

要重头开发一套这样的系统是非常非常够呛的，不过幸运的是，我之前一直在持续开发的 Minecraft 皮肤站 [Blessing Skin Server](https://github.com/printempw/blessing-skin-server)，这个项目的 v3 版本**正好**就满足的这些要求 —— 友好的用户界面、完善的用户系统、强大的后台管理、附带皮肤上传管理展示功能，再加上我之前开发的[插件系统](https://blessing.studio/laravel-plugin-system-1/)（开发这玩意真是个正确的决定，一劳永逸啊） ，这让我可以很方便地开发一个插件出来，直接基于现成的皮肤站用户系统实现 Yggdrasil API。

![API](https://i.loli.net/2017/08/04/59846283822ac.png)

### 3.3 如何使用

讲了那么多，那么到底该怎么使用呢？

1. 安装好 [Blessing Skin Server](https://github.com/printempw/blessing-skin-server/)（请参照安装说明）；
2. 下载我开发的 [`yggdrasil-api`](https://coding.net/u/printempw/p/blessing-skin-plugins/git/tree/master/yggdrasil-api) 插件，解压放入皮肤站 `plugins` 文件夹内，并在后台「插件管理」中启用本插件；
3. 编译 authlib-agent 中的 javaagent，并且将配置项中的 API 地址改成 `http://{你的站点地址}/api/yggdrasil`；
4. 参照 authlib-agent 的 [wiki 页面](https://github.com/to2mbn/authlib-agent/wiki/Deployment-Guide#%E6%97%A0forge%E7%8E%AF%E5%A2%83%E4%B8%8B%E5%8A%A0%E8%BD%BDauthlibagent)，正确加载编译好的 jar（注意，启动器、游戏、服务端都要这样 hack，否则会造成无法登录）；
5. 大功告成。

以上步骤完成后你将得到什么？

- 一个完善的账号系统（配合数据对接插件还能与 Discuz 等论坛账号互通），包括友好的注册、登录网页界面以及强大的管理员面板，在管理后台中封禁用户后，该用户也将无法登录游戏；
- 一个皮肤管理系统，自带皮肤库功能，在皮肤站中应用的皮肤，玩家无需安装任何皮肤 Mod，进入游戏即可看到自己设置的皮肤（支持双层皮肤、支持 Alex 模型，由于游戏本身限制不支持高清皮肤）；
- 单账户多角色功能，玩家可以像登录正版那样用「邮箱」和「密码」登录游戏，而且如果你在皮肤站中添加了多个角色的话，还可以在启动页面选择要用哪个角色进入游戏（Yggdrasil API 实现了这个功能，但是 Mojang 的正版登录服务器并未实现该功能），HMCL 等启动器都实现了本功能；

这还不够多吗？

而且你还可以自己修改 HMCL 等开源启动器的源码，在启动时自动注入 `-javaagent` 参数，更加方便，还能得到一个服务器专用启动器，逼格更高了（笑）

### 3.4 实现效果

皮肤站的用户管理系统、皮肤系统、后台界面之类的我就不截图了，有兴趣可以去 MCBBS 的 [发布帖](http://www.mcbbs.net/forum.php?mod=viewthread&tid=552877) 上感受一下。

![网页管理](https://img.blessing.studio/images/2017/08/04/imageac07f.png)

*▲在皮肤站「角色管理」中可添加多个角色*

![多角色选择](https://img.blessing.studio/images/2017/08/04/image.png)

*▲使用皮肤站的邮箱与密码登录后，配合 HMCL 实现多角色选择*

![游戏](https://i.loli.net/2017/08/04/5984671f87c40.png)

▲游戏内的显示效果

## 四、Yggdrasil API 踩坑记录

下面记录一些自己实现 Yggdrasil API 时踩到的坑，毕竟 wiki.vg 里并不会提到这些在自己实现 API 时需要注意的东西（提到的大部分都是使用 API 时应该要注意的），所以我也只能摸着石头过河，踩了不少坑，这里记录一下，希望能帮到后来人。

基础的 API 定义之类的我就不说了，下面主要讲一些 [文档](http://wiki.vg/Authentication) 里没怎么提到的东西。

### 4.1 登录与鉴权

用过正版 Minecraft 的登录系统的同学应该都知道，一般只有在初次登录游戏或者太久没有开过游戏的情况下，启动器才会要求你输入账号密码，其他情况下都是可以直接点击登录并启动游戏的。

但这并不是因为启动器记下了你的密码，相反，启动器保存的是 Mojang 认证服务器返回的 AccessToken。如果你曾经观察过启动器启动游戏时所用的启动参数，你就能发现其实 Minecraft 游戏本体其实只拿到了角色名、角色 Profile 对应的 UUID 以及上面提到的 AccessToken 而已。可以说，只要拿到这个 AccessToken 就可以进行几乎所有的操作了。

```text
--username 621sama
--uuid d3af753b7cda4666adc2ff9bba85e0eb
--accessToken cc1e7c7d-00ab-4f37-bbe1-983e18f1755d
```

#### 4.1.1 获取 AccessToken

用正确的 `username` 和 `password` 请求 `/authenticate` API 即可拿到 AccessToken，该令牌的有效期由服务端来决定（一般用 Redis 实现）。如果你请求 API 的时候没有带上 `clientToken`，那服务端就会帮你生成一个，你要记得把这个返回值记下来，因为 clientToken 和 accessToken 是对应关系，有些 API 是要求同时提供 AccessToken 和签发该令牌的 clientToken 的。

另外需要注意的是，这个 `/authenticate` API 中请求体中的 `username` 字段，**填的是邮箱**。

是的，你没听错，email，在 username 字段里填的是用户的 email。惊不惊喜，意不意外？这个狗屎一样的字段命名估计和历史遗留问题也有关系，因为早期 Minecraft 账号（也就是 Profile 里的那个 `legacy` 字段）是直接用**「角色名」**和「密码」登录的，但是新版 Mojang 账号（Yggdrasil API）认证是用的**「电子邮箱账号」**，Yggdrasil API 为了兼容旧账号的登录，所以搞了这么一个坑爹的东西，真是说不出话。

总之，如果想要自己实现 Yggdrasil API，是要注意一下这个神秘的 `username` 字段的。

#### 4.1.2 刷新 AccessToken

在登录成功拿到 `accessToken` 后，启动器应该把这个令牌存起来，然后在每次玩家登录游戏之前请求一次 `/refresh` API，提供 accessToken 和签发该令牌时用的 clientToken（这也是我为什么上面叫你要把这个存起来的原因），就可以拿到新签发的 accessToken 了（刷新令牌有效期）。只要令牌有效期没过，启动器就不会再次请求 `/authenticate` API。

所以，虽然文档上没说，但是其实 `/refresh` 返回的结果应该是要和 `/authenticate` 的返回结果大致相同的，包括 accessToken、clientToken、availableProfiles、selectedProfile、user 等字段（具体下面再说）。

### 4.2 API 中的 Token

Yggdrasil API 的定义中主要有两个 Token，`clientToken` 与 `accessToken`，两者为对应关系。一般来说，启动器不会频繁变动 ClientToken（通常情况下，是永远不会变的），而 AccessToken 应该在每次登录游戏时通过 `/refresh` 重新签发一个。

#### 4.2.1 Token 的生命周期

需要注意的是，AccessToken 是有生命周期的，大致如下：

```text
|---- 1. 有效 ----|---- 2. 暂时失效 ----| 3. 无效
|------------------------------------------------------> Time
```

AccessToken 刚签发时处于「有效」状态，经过一段时间后（服务端自行设置）变成「暂时失效」状态。在这种状态下的 AccessToken 是无法进入任何开启了正版验证的服务器的（也就是 `/join` API 不认），但是该令牌还是能拿来请求 `/refresh` API，这会签发一个全新的处于「有效」状态的 AccessToken 并返回给客户端。

但是如果处于「暂时失效」状态的 AccessToken 再放置一段时间后就会完全失效（一般的实现就是从 Redis 令牌桶中删掉该令牌），处于「无效」状态的 AccessToken 是无法进行任何操作的，只能让用户重新输入密码并请求 `/authenticate` API 以获取一个新的 AccessToken。

#### 4.2.2 Token 的格式

Yggdrasil API 中的 `clientToken`、`accessToken`、`id` 等字段的格式都是一大串 16 进制数字和 `-` 连字符组成的字符串，让人看起来很懵。其实这样的字符串格式就是 **通用唯一识别码**（[Universally Unique Identifier](https://zh.wikipedia.org/wiki/%E9%80%9A%E7%94%A8%E5%94%AF%E4%B8%80%E8%AF%86%E5%88%AB%E7%A0%81)）标准，也就是我们经常听到的 UUID 了。标准形式的 UUID 包含 32 位 16 进制数字，并且由连字符分割成形式为 8-4-4-4-12 的字符串，就像这样：

```
# 至于如何生成 UUID，各个语言一般都有对应的库，搜一下就有了
550e8400-e29b-41d4-a716-446655440000
```

虽然文档中没说，但是 API 请求以及响应的 `clientToken` 以及 `accessToken` 都是用的这样的标准形式。然而，需要注意的是，玩家 Profile 中的 `id` 字段格式是**不带连字符**的。下面拿 wiki.vg 中的 `/authenticate` 请求中的实例响应讲解一下：

```json
{
  // 带连字符的 UUID 格式
  "accessToken": "869a97cb-2bc8-41be-84bf-d668c299a718",
  // 带连字符的 UUID 格式，与 accessToken 对应
  "clientToken": "c0b2bac2-eb43-4af5-ae8a-e7f824cee02f",
  "availableProfiles": [
    {
      // 不带连字符的 UUID 格式，下同
      "id": "d3af753b7cda4666adc2ff9bba85e0eb",
      "name": "621sama"
    }
  ],
  "selectedProfile": {
    "id": "d3af753b7cda4666adc2ff9bba85e0eb",
    "name": "621sama"
  },
  "user": {
    "id": "d3af753b7cda4666adc2ff9bba85e0eb",
    "properties": []
  }
}
```

至于后端存储时用怎样的格式就随意了，不过在 API 返回结果中是一定要按照上面的格式来的。

### 4.4 多角色选择功能

虽然 Mojang 官方迄今为止仍未支持同一个**账号**（Mojang 账号，用邮箱登录的那个）下添加多个**角色**（角色名，就是游戏里显示的那个），但是 Yggdrasil API 本身是可以实现这个**「单账号多角色」**功能的，并且官方启动器、HMCL 等著名的第三方启动器都支持**登录后选择角色进入游戏**（具体效果参见上方截图）。

如果你仔细阅读过 wiki.vg 里的 API 文档的话就会发现，`/authenticate` 里面有好几个包含了 Profile 的字段，分别是 `availableProfiles`、`selectedProfile` 和 `user`。下面我稍微说一下这几个字段的功能。

首先，`availableProfiles` 中存放的是这个**账号**下所有可用**角色**的 Profile，格式为 JSON 数组：

```json
"availableProfiles": [
  {
    "id": "不带连字符的 UUID",
    "name": "角色名"
  },
  {
    "id": "d3af753b7cda4666adc2ff9bba85e0eb",
    "name": "621sama"
  }
]
```

需要注意的是，每个**角色 Profile** 都应该有一个唯一的 `id`（格式为不带连字符的 UUID），而不是每个账号一个。而且，虽然官方文档上没有写，其实 `/refresh` API 返回的结果应该和 `/authenticate` 一样带上 `availableProfiles` 这个属性（因为只有第一次密码登录才会请求 `/authenticate`，之后进游戏就只会请求 `/refresh` 了）。

而 `selectedProfile` 字段内容为**被选中**的角色 Profile。如果这个字段存在，启动器就会**直接**用这个角色进入游戏。只有在 `selectedProfile` 字段不存在时，启动器才会弹出「选择角色」对话框，并根据用户的输入选择不同的角色进入游戏。如果你想要搞支持**单账户多角色**的 API 的话，可以不用管这个字段（不过当该账号名下只有一个角色的话记得指定 `selectedProfile` ，这样启动器就可以直接用这个角色进游戏了）。

至于 `user` 字段是只有在请求时带上了 `requestUser` 属性时才会回复的，其中包括被选中角色的 UUID、语言偏好、Twitch 的 AccessToken 等等，一般来说，自己实现 Yggdrasil API 时可以忽略这玩意（而且这个属性对单账户多角色的支持并不好）。

### 4.5 加载皮肤与披风

这里稍微提一下 Minecraft 使用 Yggdrasil API 时加载皮肤的原理。

首先你要知道，Minecraft 游戏启动时从启动器那边（i.e. 从命令行）拿到的 API 相关属性只有「AccessToken」、「选中角色的 UUID」以及「选中角色的角色名」这三样东西。获取 Profile 以及加载皮肤是 Minecraft 游戏该做的工作，具体流程如下。

#### 4.5.1 获取完整 Profile

首先 Minecraft 会请求 API `/profiles/minecraft/{uuid}` 获取角色的完整 Profile，差不多长这样：

```json
{
  "id": "d3af753b7cda4666adc2ff9bba85e0eb",
  "name": "621sama",
  "properties": [
    {
      "name": "textures",
      "value": "eyJ0aW1lc3RhbXAiOjE1MDIyMDA5OTAwMjgsInByb2ZpbGVJZCI6ImQzYWY3NTNiLTdjZGEtNDY2Ni1hZGMyLWZmOWJiYTg1ZTBlYiIsInByb2ZpbGVOYW1lIjoiNjIxc2FtYSIsImlzUHVibGljIjp0cnVlLCJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly9za2luLmRldi90ZXh0dXJlcy84MzRjYmQ4NDhmMGEyOTAwOGJmNWIxZDU5ZDAyZWNiMWNmMjVkZmQyMWZjODhiZTFjMTgzYzkyNjFmNWZkZDY5In0sIkNBUEUiOnsidXJsIjoiaHR0cDovL3NraW4uZGV2L3RleHR1cmVzLzI5MTE0MzhlODI4MmQ0MGU2ZDY0ZmJlZmQwNzZlZWYwYTkwMWNiOTBkM2RlYWU0MDU3ZmVjNjBjNjZlYjkzZDIifX0sInNpZ25hdHVyZVJlcXVpcmVkIjp0cnVlfQ==",
      "signature": "Zvox4YClUMHIAMe1tRLV/JmMaGF0pZhkmrigFpo7jOme8f559gZVyBQoTXeZsXn7Hwq5TE0b9m09MzuAGoT7dQ7kxkHA60xvVQXMQlbWP5O+EA8fzOM0hgINe8Qv7hSBG89osr+wWE7pTJ1CIKD6CBoK1a/U9UiCyQuDlO2gnfnXebBDIXJCBMKiowTu1LubZ9EQn7WkgrFD/M7TY+2dr8DOdoq15Pv0EZ2kLO1Gu9y6vOPq+5nAhce/TN/sWGAvfCJJkSYqALBSFh7QkExTJXPM7QHgP++rn96m6/nDe/ND6NwEovwdVqD5KiPnTvzRLkr92QEdZniT6hH2DUrToA=="
    }
  ]
}
```

好吧好吧，看到这么多字符先别懵，`value` 和 `signature` 字段的内容都是 BASE64 编码过的，解码后 `value` 字段就是个普通的 JSON 而已。至于 JSON 里是什么内容，就自己去看 wiki 吧。

#### 4.5.2 数字签名

需要注意的是上述 Profile 中的 `signature` 字段。顾名思义，这个字段就是 `value` 字段的数字签名。虽然官方 API 只有在指定 `unsigned=false` 时才会返回带签名的 Profile，但是目前（截至本文发布） authlib-agent 在服务端未返回数字签名时会出现[神秘的错误](https://github.com/printempw/blessing-skin-server/issues/81)，所以还是默认返回 `signature` 字段来得好。

至于数字签名如何生成，其实就是用的 OpenSSL 内置的签名算法。在编译 authlib-agent 时就会生成一组 OpenSSL 密钥对，直接把生成的 RSA 私钥 `key.pem` 拿来用就可以了。各个平台都有 OpenSSL 库的实现，我这里贴一下 PHP 的示例代码：

```php
$privateKeyPath = __DIR__.'/key.pem';

// Load private key
if (! file_exists($privateKeyPath)) {
  throw new IllegalArgumentException('RSA 私钥不存在');
}
  
$privateKeyContent = file_get_contents($privateKeyPath);

$key = openssl_pkey_get_private($privateKeyContent);

if (! $key) {
  throw new IllegalArgumentException('无效的 RSA 私钥');
}

openssl_sign($data, $sign, $key);

openssl_free_key($key);

return base64_encode($sign);
```

其他语言大同小异，我就不多赘述了。

#### 4.5.3 加载材质

拿到角色 Profile，并且验证了数字签名后（签名不对的话不会加载的），Minecraft 游戏就会根据 Profile 中指定的皮肤、披风图片 URL 加载材质。需要注意的是，Minecraft 自带的 authlib 是只会加载 Mojang 官方域名下的材质的（白名单之外的材质地址是不会被加载的），这也是为什么需要 CustomSkinLoader 等皮肤 Mod 的原因。不过 [authlib-agent](https://github.com/to2mbn/authlib-agent/blob/master/configure.sh) 自带了 authlib 的 hack，在编译的时候可以直接指定材质加载白名单即可：

```shell
# configure.sh
#
# 要加入到 authlib 的白名单的域名的结尾
# authlib 只会从符合白名单的域名下载皮肤
# 多个域名间使用 | 分隔
# 例如: '.example.com', '.skinserver1.com|.skinserver2.com'
export AGENT_SKIN_DOMAINS='skin.prinzeugen.net'
```

如果一切正常，游戏内就会显示你的自定义皮肤了。

### 4.5 加入服务器

在 Minecraft 中加入一个服务器时，客户端会向 `/join` API 发出一个请求，请求体中包含了 AccessToken、当前角色的 UUID 以及服务器的唯一标识符 `serverId`（这玩意如何生成不用我们操心，Minecraft 游戏里会搞好的，你只管存这个就行了）。

在后端实现上，一般来说就是在 Redis 这类内存数据库中放一个键值对，具体数据结构你自己想。

向 Yggdrasil API 发送完 `join` 请求后，Minecraft 客户端会向要加入的那个游戏服务器发送一个请求（这部分我们不用操心），服务器收到加入请求后，会向 Yggdrasil API 发送一个 `hasJoined` 请求（Query String 中包含角色名、IP 以及服务器唯一标识符），如果该用户已经加入了服务器（也就是判断数据库中有没有之前 `join` 时添加的记录），那就返回角色的完整 Profile，同时服务器允许用户进入。

这也就是为什么客户端和服务端同样需要使用 authlib-agent hack 的原因，因为我们要确保两者请求的都是同一个 API，这样才能起到一个维护登录状态的功能。

### 4.6 经常用到的 API

虽然 Yggdrasil 规范中定义了很多 API，但是其实日常游戏中用到的没几个，这里列举一些频繁使用的 API，也方便诸君知道哪里该认真开发哪里可以小小偷懒一下：

```
# 初次登录时，用账号密码拿到 AccessToken
POST /authenticate
# 之后的登录都是直接用这个 API 签发新的令牌
POST /refresh
# 加入服务器
POST /joinserver
# 验证是否加入了服务器
GET  /hasjoinserver
# 获取玩家完整 Profile
GET  /profiles/minecraft/{uuid}
```

其他 API 感觉都是几万年用不到一次的，很神秘。

### 4.6 使用 authlib-agent 的注意事项

虽然 authlib-agent 可以将默认的 Mojang Yggdrasil API 服务重定向至自定义的 API 的地址，但是并不是所有 API 的 URI 定义都是和 Mojang 的版本一模一样的。这里稍微列举一下（截止至 2017-08-08）：

**和 Mojang 官方 API 一样的：**

```
# API Root: https://authserver.mojang.com
====================================
## 登录认证
POST /authenticate

## 刷新 AccessToken
POST /refresh

## 验证 ClientToken 与 AccessToken 对是否有效
POST /validate

## 用 ClientToken 使指定的 AccessToken 失效
POST /invalidate

## 使用账号密码，失效所有的 AccessToken
POST /signout
```

**和 Mojang 官方 API 不一样的：**

```
# API Root: https://sessionserver.mojang.com
====================================
## 加入服务器，提供服务器 ID 与 Profile UUID
## 对应 /session/minecraft/join
POST /joinserver

## 验证玩家是否加入了服务器
## 对应 /session/minecraft/hasJoined
GET  /hasjoinserver

## 使用 UUID 获取玩家 Profile
## 对应 /session/minecraft/profile/{uuid}
GET  /profiles/minecraft/{uuid}

## 批量查找玩家 Profile
## 对应 https://api.mojang.com/profiles/minecraft
POST /profilerepo

## 使用玩家名查找 Profile
## 无 Mojang 对应官方 API
## 我也不知道 authlib-agent 里写这个玩意干嘛的，看他字节码替换的时候也没用到
GET  /username2profile/{username}
```

## 五、后记

上周折腾了好几天这玩意，写篇博文记录一下，既能理清自己的思路，还有可能帮到后来人~~（花时间研究了东西，却没人知道，多亏啊）~~，何乐而不为呢 :P

### 5.1 参考链接

- http://wiki.vg/Authentication
- http://wiki.vg/Protocol_Encryption#Authentication
- http://wiki.vg/Mojang_API
- https://github.com/to2mbn/authlib-agent/wiki
- [https://zh.wikipedia.org/wiki/通用唯一识别码](https://zh.wikipedia.org/wiki/%E9%80%9A%E7%94%A8%E5%94%AF%E4%B8%80%E8%AF%86%E5%88%AB%E7%A0%81)
- [php-rsa - 加密解密和签名](http://xbgtalk.biz/2015/11/03/php-rsa-encode-decode-sign/)
- [blessing-skin-plugins/yggdrasil-api](blessing-skin-plugins/yggdrasil-api)