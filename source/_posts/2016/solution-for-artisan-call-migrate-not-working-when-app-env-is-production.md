---
title: "Artisan::call('migrate') 在 APP_ENV 为 production 时不工作的解决方法"
date: '2016-12-13 22:44:11'
updated: '2017-05-14 13:40:53'
categories: 技术
tags:
  - Laravel
  - PHP
---

最近把版本库里 `.env.example` 的 `APP_ENV` 字段值从原来的 `local` 改为了 `production`，原意是为了更好的区分开发和生产环境。

然而今天在主机壳的虚拟主机上测试我的程序的时候（准备把演示站搬过去），却出现了奇怪的问题——数据库 Migration  不管用了。

我是在控制器里通过调用 `Artisan::call('migrate')` 来执行数据库迁移操作的（毕竟虚拟主机哪来的 shell 访问），但是这次这条命令竟然没有执行任何事务。

通过 `Artisan` 执行 `Command` 的简化流程大概是像这样的：

```
Illuminate\Foundation\Console\Kernel
↓
Illuminate\Console\Application
↓
Illuminate\Console\Command
↓
Illuminate\Container\Container
↓
// 这个就是执行 Artisan::call('migrate') 时调用的类
Illuminate\Database\Console\Migrations\MigrateCommand
↓
……
```

经过一段时间的排查，最后锁定了是在 `MigrateCommand` 这个类停止继续往下执行的，即接下来的脚本都没有被执行到，也就是说问题就出在 `MigrateCommand` 这里。

<!--more-->

在这个类的 `fire` 方法里，我们可以看到：

```
if (! $this->confirmToProceed()) {
    return;
}
```

就是因为这个 `$this->confirmToProceed()` 返回了一个 `bool(false)`，才导致脚本在这里停止执行了。

这个 `confirmToProceed` 方法是定义在 `Illuminate\Console\ConfirmableTrait` 里的，通过阅读代码我们可以知道这个方法可以让我们传进去一个回调（或者让它在 shell 里要求用户输入 Y 确认）来确认是否要执行这个 action。

![要求确认的栗子](https://img.prin.studio/legacy/image.php?di=I5NU)

不巧的是，在 `MigrateCommand` 里并没有传 `callback` 给这个方法，所以它就使用了默认的回调：

```
/**
 * Get the default confirmation callback.
 *
 * @return \Closure
 */
protected function getDefaultConfirmCallback()
{
    return function () {
        return $this->getLaravel()->environment() == 'production';
    };
}
```

罪魁祸首出现了！没错，就是因为我把 `APP_ENV` 给改成了 `production` 造成了这个情况。

而我是通过 `Artisan::call('migrate')` 来调用命令的，自然不可能执行什么确认操作，也就导致了 migration 不干事。

--------------

解决方法就是在调用 `Artisan::call` 命令时加上一个 `--force` 参数来让它忽略确认操作强制执行：

```php
Artisan::call('migrate', ['--force' => true]);
```

谨以此记录，愿能帮到后来人。


