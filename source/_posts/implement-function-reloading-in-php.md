---
title: 'PHP 实现函数重载（伪）'
date: '2016-07-12 12:02:51'
updated: '2016-07-12 12:02:51'
categories: 技术
tags:
  - PHP
---

众所周知，PHP 作为一门弱类型的语言，是无法直接实现像 C++，Java 那样的函数重载的。然而在某些情况下，这就非常蛋疼了。不过我们可以用一些奇技淫巧来实现「伪函数重载」。

### 一、使用 `func_get_args()` 函数

[`func_get_args()`](http://php.net/manual/zh/function.func-get-args.php) 函数可以获取函数参数列表的数组，我们就可以利用一下这个特性啦。

<!--more-->

```
<?php

class Shit
{
    /**
     * Function reload
     */
    public static function fuck()
    {
        $args = func_get_args();
        if (count($args) == 1) {
            self::fuckMultiple($args[0]);
        } elseif(count($args) == 2) {
            self::fuckSingle($args[0], $args[1]);
        }
    }

    private static function fuckMultiple(Array $humans)
    {
        foreach ($humans as $human) {
            self::fuckSingle($human['name'], $human['sex']);
        }
    }

    private static function fuckSingle($name, $sex)
    {
        if (is_string($name) && is_bool($sex))
            echo ($sex ? "$name, boy♂next♂door" : "$name, my little baby~")."<br />";
        else
            echo "Invalid parameters.";
    }
}

echo Shit::fuck(Array(
   ['name' => 'sabi', 'sex' => true],
   ['name' => 'maki', 'sex' => false]
));

echo Shit::fuck('jack', true);
```

### 二、使用魔术方法

当访问对象中一个不存在的方法时就会调用 `__call()` 方法，静态调用不存在的方法时则会调用  `__callStatic()` 方法。我们也可以利用这两个魔术方法来实现函数重载。

具体的例子在 [PHP Manual](http://php.net/manual/zh/language.oop5.overloading.php#example-240) 上就有了，我就不多赘述了。




