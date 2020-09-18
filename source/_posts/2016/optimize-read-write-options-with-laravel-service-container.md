---
title: '使用 Laravel 的服务容器来优化读写数据库中的 options'
date: '2016-08-28 22:58:16'
updated: '2016-09-16 13:00:43'
categories: 技术
tags:
  - Laravel
  - 分享
---

这篇文章应该算是心得体会一类的吧，因为并没有什么卵用（笑

就像前两篇文章说的一样，在我把项目框架改为 Laravel 后，自然要最大限度地利用 Laravel 的特性来提升我们应用的性能~~（虽然使用 Laravel 本身就是在降低性能了）~~，并且让我们的代码看起来更优雅 ~~装逼~~。

其中我们可以最方便地利用的一个特性就是 Laravel 的服务容器了。在这里我不多赘述 Service Container 是个啥，想了解的可以自行搜索。不想了解的就只要大致知道它是个可以 绑定/取出 实例的东西就好了（当然服务容器可不止这么点功能）。

相信很多 Web 应用都会在数据库建立一个 `options` 表来储存一些用户的配置信息，而为了方便，我们通常会封装一个 `Option` 类来方便地进行数据的 `get`、`set` 操作。而通常的做法是把这些操作做成类内静态方法来调用。

但是这样的弊端就是每一次的操作都要去查询数据库，这对于性能还是有挺大影响的，尤其是在一次响应中要使用很多 options 的情况下。

<!--more-->

那么在 Laravel 下我们可以怎么优化呢？

蛤？你说 Eloquent？你 TM 长点脑子啊
![](https://img.prin.studio/legacy/image.php?di=UPMZ) 用了 ORM 那 tm 还叫优化？你们呀，不要听的风是得雨，看到 Laravel 就想到 Eloquent！

好吧好吧，再强行 +1s 是要出事的，我们回到正题。没错，我们正是要把 `options` 放到 Laravel 的服务容器里去。

这样的话我们只需要在应用启动的时候实例化一个 `OptionRepository` 类，在构造函数里读入所有的 `options` 并放到类内属性上，`get` 方法直接从该属性里取值，而调用 `set` 操作的时候则对该属性进行修改，同时 push 修改过的 `key` 到一个 `$items_modified` 数组里去，在对象析构的时候再真正执行数据库操作，写入所有修改过的 `options`。

`OptionRepository` 类的具体实现可以看这里：[App\Services\OptionRepository](https://github.com/printempw/blessing-skin-server/blob/master/app/Services/OptionRepository.php)

不过光是实现了一个 Repository 还是不够的，我们还需要把它绑定到服务容器里，同时注册个 Facade 给它，让我们能够更优雅地调用仓库类的相关方法：

```
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        // 绑定单例到服务容器上
        $this->app->singleton('option', \App\Services\OptionRepository::class);
    }
}
```

新建一个 `Option` 类并集成 Laravel 的 `Facade` 基类：

```
<?php

namespace App\Services\Facades;

use \Illuminate\Support\Facades\Facade;

class Option extends Facade
{
    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor()
    {
        return 'option';
    }
}
```

然后我们在 `config/app.php` 中加入我们 Facade 的别名：

```
<?php

return [
    'aliases' => [
        'Option'    => App\Services\Facades\Option::class
    ],

];
```

大功告成！我们现在又可以像以前那样方便地使用类似于 `Option::get('shit')` 的方法获取数据，而且又大幅减少了数据库操作，是不是很棒呢~ (=ﾟωﾟ)=

好吧其实本文也没讲啥有用的东西，不过希望对从其他框架迁移到 Laravel 的开发者们有所启示~
