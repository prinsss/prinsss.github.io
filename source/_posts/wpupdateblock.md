---
title:   '关闭 WordPress 更新提示'
date:    '2015-05-01 21:10:38'
updated: '2015-05-03 17:11:57'
categories: 技术
tags:
  - WordPress
  - 分享
---

### 使用插件  

[Easy Updates Manager](https://wordpress.org/plugins/stops-core-theme-and-plugin-updates/)

### 麻烦点的方法

将下面的代码添加到主题目录下的 `functions.php` 中 `?>` 之前的任意位置：

```php
add_filter('pre_site_transient_update_core', create_function('$a', “return null;”));
add_filter('pre_site_transient_update_plugins', create_function('$a', “return null;”));
add_filter('pre_site_transient_update_themes', create_function('$a', “return null;”));
remove_action('admin_init', '_maybe_update_core'); remove_action('admin_init', '_maybe_update_plugins');
remove_action('admin_init', '_maybe_update_themes');
```

以下代码添加至 `wp-config.php`：

```php
define( 'AUTOMATIC_UPDATER_DISABLED', true );
```
