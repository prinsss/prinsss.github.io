---
title: '使用 Laravel 的 监听者模式实现缓存机制的松散耦合'
date: '2016-08-30 12:49:32'
updated: '2016-08-30 12:49:48'
categories: 技术
tags:
  - PHP
  - Laravel
  - 分享
---

唔，我也不知道我接下来要讲的东西是不是配得上这个题目，总之就是分享一下我在搞 Blessing Skin Server 的缓存与插件机制时的一些经验（大佬们就请忽略吧）

既然要实现松散耦合的缓存机制，那就是要做到有没有缓存都没事。有缓存的话就走缓存，然后那边的模块内部实现一个包括过期时间呀啥啥的缓存机制，没有收到缓存模块的响应的时候就继续走原来的应用逻辑，一样可以正常响应。

因为我们是要实现应用逻辑与缓存逻辑的解耦，所以正常应用逻辑内是不能有对那些缓存的依赖的。那么我们要通过什么来和缓存模块通信呢？巧的是，Laravel 正好提供了基于 Event 和 Listener 的观察者模式，我们就可以用这种设计模式来解耦缓存模块。

<!--more-->

首先，我们在即将获取一个可能需要缓存的数据之前，触发一个 `GetDataEvent`（举个栗子），接下来判断这个 Event 是否返回了响应，如有则使用响应的内容，没有的话就继续正常的应用逻辑来获取数据。

譬如说，我们需要把皮肤的预览图给缓存下来，而不是每次都去生成：

```
<?php

namespace App\Events;

use App\Events\Event;
use App\Models\Texture;
use Illuminate\Queue\SerializesModels;

class GetSkinPreview extends Event
{
    use SerializesModels;

    public $texture;

    public $size;

    /**
     * 这里我们并没有做什么，就是把实例化时传进来的参数保存到对象里去
     *
     * @return void
     */
    public function __construct(Texture $texture, $size)
    {
        $this->texture = $texture;
        $this->size    = $size;
    }
}

```

```
// 控制器中的方法
public function preview($tid, $size = 250)
{
    // 触发事件
    $responses = Event::fire(new GetSkinPreview($t, $size));

    // 当然，如果你有多个 Listener 的话，在这里你可能需要遍历 Event 所返回的响应
    if (isset($responses[0]) && $responses[0] instanceof \Symfony\Component\HttpFoundation\Response) {
        // 这个返回的响应类型是看你自己对 Event 的需求的
        // 比如这里我们需要 Listener 返回一个 Http 响应流
        return $responses[0];
    } else {
        /* 原来业务逻辑中的生成预览 */

        return Response::png();
    }
}
```

而这个 `GetDataEvent`，我们是可以注册 Listener 上去的，具体如何添加 Event 和 Listener 请参考 Laravel 文档。假设我们在这里给这个事件注册了一个 `CacheDataListener`，那么在 GetDataEvent 这个事件在应用逻辑中被触发的时候，Laravel 的 Event Dispatcher 就会把事件分发到我们刚刚注册的监听器里，我们就可以在监听器的 `handle` 方法中处理缓存逻辑并返回缓存后的数据了。

```
<?php

namespace App\Listeners;

use Storage;
use App\Events\GetSkinPreview;

class CacheSkinPreview
{
    /**
     * 处理缓存逻辑并返回一个 Http 响应流
     *
     * @param  GetSkinPreview  $event
     * @return void
     */
    public function handle(GetSkinPreview $event)
    {
        $tid = $event->texture->tid;

        if (!Storage::disk('cache')->has("preview/$tid")) {
            /* 这里生成预览并保存到缓存文件 */
        }

        return \Response::png(Storage::disk('cache')->get("preview/$tid"));
    }
}
```

这样下来，我们就可以让应用逻辑和缓存逻辑（差不多）完全分离开来，想要使用其他的缓存驱动，例如 Redis 的话，只要新建一个 Listener 并监听 `GetDataEvent` 就可以了。你甚至可以把缓存机制放到插件里去，而这也就是我本来的目的（笑）

以上只是我的个人见解，如果有什么不对的地方，还请大佬们多指教啊 (つд⊂)
