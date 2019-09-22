---
title: '又是一种用于 JavaScript 的前端国际化方案'
date: '2016-09-15 12:04:31'
updated: '2016-09-16 12:46:40'
categories: 技术
tags:
  - JavaScript
---

现在 Blessing Skin Server 的 HTML 模板是使用 Laravel 自带的本地化来实现多语言支持的，并且使用了 [devitek/yaml-translation](https://github.com/Devitek/laravel-yaml-translation) 这个包把 Laravel 语言文件从默认的 PHP 数组形式改为 YAML 格式的文件。

不得不说数组形式的语言文件简直反人类好吗，一大堆 `=>` 看的眼晕。。YAML 大法好！(ゝ∀･)

回到正题。虽然 HTML 模板里的国际化是解决了，但是整个应用中需要国际化的地方可不止 HTML 模板，同时还有 JavaScript。但是静态的脚本文件中总不能内嵌 PHP 吧，所以我们得搞个单独的解决方案。

虽然说网上现成的 JS 国际化的库很多，但我总觉得有些看不上眼（可能是我没找到好的），就准备自己实现一下。

<!--more-->

首先我们需要一个全局变量来保存从语言文件里读出来的东西：

```javascript
// 保存所有加载的语言文件
$.locales = {};
// 当前选择的语言翻译文件
var locale = {};
```

这里我们把 `locales` 这个字典绑到了 jQuery 定义的全局变量 `$` 上，这也就意味着要依赖 jQuery 了。当然你不绑在 `$` 上也是一点关系也没有的，因为我们下面并不需要用到 jQuery。

现在我们就可以在语言文件中这样写了：

```javascript
(function ($) {
    "use strict";

    $.locales['zh-CN'] = {
        auth: {
            login: '登录',
            validation: {
                emptyPassword: '密码要好好填哦'
            }
        },
        user: {
            changeNickName: '确定要将昵称设置为 :new_nickname 吗？'
        },
        general: {
            confirm: '确定',
            cancel: '取消'
        }
    };
})(window.jQuery);
```

如果你不准备依赖于 `$` 这个变量，就把闭包的作用域和里面的变量名改一下。总之就是保证它可以被全局地访问到就好。

因为我们可能会加载多个含有语言文件的 `locale.js` 文件，所以我们需要判断一下当前语言，然后把对应的语言字典加载到上面定义的 `locale` 变量中：

```javascript
function loadLocales() {
    for (lang in $.locales) {
        // 这里你可以进行进一步的加载判断
        if (!isEmpty($.locales[lang])) {
            locale = $.locales[lang] || {};
        }
    }
}
```

上面用到的那个 `isEmpty` 函数可以看这里：[@Gist](这个 isEmpty 函数可以看这里：https://gist.github.com/printempw/ac924ca2952a93667f8211b7b626a2fd)。然后我们就可以定义用于把 `key` 翻译成具体语言的翻译函数啦：

```javascript
function trans(key, parameters) {
    if (isEmpty(locale)) {
        // 载入当前所选的语言至全局变量
        loadLocales();
    }

    parameters = parameters || {};

    var segments = key.split('.');
    var temp = locale || {};

    for (i in segments) {
        if (isEmpty(temp[segments[i]])) {
            // 如果该项不存在，则原样返回 key
            return key;
        } else {
            temp = temp[segments[i]];
        }
    }

    for (i in parameters) {
        if (!isEmpty(parameters[i])) {
            // 替换语言字符串中的占位符
            temp = temp.replace(':'+i, parameters[i]);
        }
    }

    return temp;
}
```

这里可以看到这个函数接受两个参数，`key` 和 `parameters`。`key` 就是用于翻译的键值了，并且我们可以传一个 `dict` 作为参数来替换语言字符串中的占位符。

而且在 `key` 的处理中，我们解析了类似于 `auth.login` 这样的 `key`，并且是可以无限嵌套下去的。是不是感觉挺熟悉的？没错，就是 Laravel 翻译器也在使用的「点」语法 (　ﾟ 3ﾟ) 我是觉得蛮不错的就搬过来了（笑

现在我们在加载完语言文件后就可以使用这个函数来实现前端国际化啦：

```javascript
trans('auth.validation.emptyPassword');
// 返回 "密码要好好填哦"
trans('user.changeNickName', { new_nickname: 'FUCK' });
// 返回 "确定要将昵称设置为 FUCK 吗？"
```

