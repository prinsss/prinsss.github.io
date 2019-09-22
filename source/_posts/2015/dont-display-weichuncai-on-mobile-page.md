---
title: 'Wordpress 隐藏移动版页面的伪春菜'
date: '2015-06-28 18:56:21'
updated: '2016-04-11 21:40:11'
categories: 技术
tags:
  - WordPress
  - 博客
---


窝现在在用的这个伪春菜插件，似乎没有加入判断是否移动端的逻辑，然而移动页面上的伪春菜体验超级差，低分辨率设备甚至出现被糊一脸且点不到隐藏的情况 [![QQ图片20150621134022](https://img.blessing.studio/images/2015/06/2015-06-21_05-40-30.gif)](https://img.blessing.studio/images/2015/06/2015-06-21_05-40-30.gif)

虽然咱不会 php 但也只好借助咕狗大神的力量自力更生了

看了看插件源码，折腾出解决方案如下 [![20150503124308](https://img.blessing.studio/images/2015/05/20150503124308.jpg)](https://img.blessing.studio/images/2015/05/20150503124308.jpg)，都是修改插件中的 `sm-weichuncai.php`

一、插入 `isMobile()` 判断函数

```php
/**
 * 是否移动端访问访问
 *
 * @link http://www.codeceo.com/article/php-ismobile.html
 * @return bool
 */
function isMobile()
{ 
    // 如果有 HTTP_X_WAP_PROFILE 则一定是移动设备
    if (isset ($_SERVER['HTTP_X_WAP_PROFILE'])) {
        return true;
    } 
    // 如果 via 信息含有 wap 则一定是移动设备，部分服务商会屏蔽该信息
    if (isset ($_SERVER['HTTP_VIA'])) { 
        // 找不到为flase,否则为true
        return stristr($_SERVER['HTTP_VIA'], "wap") ? true : false;
    } 
    // 脑残法，判断手机发送的客户端标志，兼容性有待提高
    if (isset ($_SERVER['HTTP_USER_AGENT'])) {
        $clientkeywords = array ('nokia',
            'sony',
            'ericsson',
            'mot',
            'samsung',
            'htc',
            'sgh',
            'lg',
            'sharp',
            'sie-',
            'philips',
            'panasonic',
            'alcatel',
            'lenovo',
            'iphone',
            'ipod',
            'blackberry',
            'meizu',
            'android',
            'netfront',
            'symbian',
            'ucweb',
            'windowsce',
            'palm',
            'operamini',
            'operamobi',
            'openwave',
            'nexusone',
            'cldc',
            'midp',
            'wap',
            'mobile'
            ); 
        // 从 HTTP_USER_AGENT 中查找手机浏览器的关键字
        if (preg_match("/(" . implode('|', $clientkeywords) . ")/i", strtolower($_SERVER['HTTP_USER_AGENT']))) {
            return true;
        } 
    } 
    // 协议法，因为有可能不准确，放到最后判断
    if (isset ($_SERVER['HTTP_ACCEPT'])) { 
        // 如果只支持wml并且不支持html那一定是移动设备
        // 如果支持wml和html但是wml在html之前则是移动设备
        if ((strpos($_SERVER['HTTP_ACCEPT'], 'vnd.wap.wml') !== false) && (strpos($_SERVER['HTTP_ACCEPT'], 'text/html') === false || (strpos($_SERVER['HTTP_ACCEPT'], 'vnd.wap.wml') < strpos($_SERVER['HTTP_ACCEPT'], 'text/html')))) {
            return true;
        } 
    } 
    return false;
}
```

二、在 `get_chuncai()` 中加入判断逻辑

```php
// 获得春菜 
function get_chuncai() { 
    if (isMobile() == false) { 
    /* 这里一大块是原来 get_chuncai() 的代码 
     * 咱只是在外面包了一层if而已 
     * 说起来php是没有 not() 的吗？ 
     */
    } 
}
```

**UPDATE**：重新修订于 9.14



