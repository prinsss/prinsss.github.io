---
title: 'String.prototype.endsWith() 的浏览器兼容性问题'
date: '2016-09-26 22:28:29'
updated: '2016-09-26 22:28:29'
categories: 技术
tags:
  - 踩坑
  - JavaScript
---

`String.prototype.endsWith()` 这个方法是 ECMA6 新加入的，而我当初随手 Google 了一下，也没怎么看就直接用上去了，直到我今天在一台破手机上测试的时候发现有个用到这个方法的值神秘地变成了 `undefined` ( ´_ゝ`)

我记得上次好像也是这样随手搜索导致使用了不兼容的函数 ( -д-) ~~论面向搜索引擎编程的坏处~~

不过我们还是可以通过扩展 `String` 的原型来实现在不支持的浏览器上使用这个方法：

```
/**
 * 代码来自 MDN
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
 */

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.lastIndexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}
```
