---
title: '[User Script] 自动填写 KodExplorer 登录表单'
date: '2015-12-06 02:05:50'
updated: '2016-01-30 20:33:38'
categories: 技术
tags:
  - JavaScript
---

应该挺多人知道 [KodExplorer](http://kalcaddle.com/index.html) 吧？一个用 PHP 编写的很棒的在线文件管理器。 因为是文件管理，拥有着 www 用户组的所有权限，自然是一定要用强口令的。然而 KodExplorer 登录页不是用 form 表单提交的，chrome 的自动保存也没用了，每次都输强口令也挺麻烦的，所以写了个脚本一键填写登录表单并提交，放入书签栏即可食用~ KodExplorer 的登录逻辑都在 `./static/js/app/src/user/main.js` 里，有用的一段在这里：

```javascript
var e = function() {
    var e = $("#username").val(),
    t = $("#password").val(),
    a = $("input[name=rember_password]").attr("checked") ? 1 : 0,
    i = "./index.php?user/loginSubmit&name=" + urlEncode(e) + "&check_code=" + $("input.check_code").val() + "&password=" + urlEncode(t) + "&rember_password=" + a;
    window.location.href = i
};
$("#username").focus(),
$("#submit").bind("click", e),
$("#username,#password,input.check_code").keyEnter(e)
```

关键行已高亮标出（话说明文 POST 密码真的好吗。。），下面是脚本代码（Greasemonkey 用户脚本）：

```javascript
// ==UserScript==
// @name         KodExplorer Auto Login
// @namespace    https://prinzeugen.net/
// @version      0.1
// @description  自动登录 Kodexplorer
// @author       prin
// @match        https://prinzeugen.net:12450/kodexplorer-14012/index.php?user/login
// @grant        none
// ==/UserScript==
/* jshint -W097 */
'use strict';

var username = "root";
var password = "NAKAkoi2411explorer";  // 自己修改
var remberPasswd = document.getElementById("username") ? 1 : 0;
var url = "./index.php?user/loginSubmit&name=" + encodeURIComponent(username) + "&check_code=" + "&password=" + encodeURIComponent(password) + "&rember_password=" + remberPasswd;
window.location.href = url;
```

### 更新日志：

2015-12-31 使用 User Script 重写

以下为原来的书签版本：

压缩后可以放到书签栏里的版本（记得自己修改用户名，密码）：

```javascript
javascript:var u="",p="",rp=document.getElementById("username")?1:0,url="./index.php?user/loginSubmit&name="+urlEncode(u)+"&check_code="+"&password="+urlEncode(p)+"&rember_password="+rp;window.location.href=url;
```

