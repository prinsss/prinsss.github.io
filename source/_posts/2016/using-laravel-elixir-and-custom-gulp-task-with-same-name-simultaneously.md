---
title: '同时使用 Laravel Elixir 和同名自定义 Gulp Task 时的坑'
date: '2016-08-28 17:46:41'
updated: '2016-08-28 22:58:47'
categories: 技术
tags:
  - 记录
  - Laravel
  - PHP
---

今天上午我把 Blessing Skin Server 的框架改为了 Laravel，到处修修改改一会后终于可以跑起来了。因为我之前也是使用的 Blade 模板引擎和与 Illuminate\Routing 语法类似的路由库，所以迁移过程还算是挺无痛的。

迁移稍微告一段落后，我就准备使用一下以前一直很想用的 Laravel 对常用 Gulp Task 的封装：[Laravel Elixir](https://www.laravel.com/docs/5.2/elixir)。

改写原来 gulpfile.js 中的原生 Gulp Tasks 到 Laravel Elixir 的模式并不算麻烦，常用的 task 都有集成，并且通过链式调用的方式依次执行各个 Task。

改写好后，直接运行 `$ gulp` 即可执行所有的 elixir tasks，并且执行完毕后还会有详细的表格报告和 Toast 通知，非常的方便。

但是，不知道是我的姿势不对还是怎么回事，我没有找到能够把一个目录下所有的 css/js 文件压缩后复制到另一个目录的 elixir task，无奈之下只好写成原生的 Gulp Task，并且使用 elixir 的 `mix.task()` 方法来调用：

<!--more-->

```
elixir(function(mix) {
    mix
        .scripts(vendor_js, 'assets/js/app.min.js', './')

        .styles(vendor_css, 'assets/css/app.min.css', './')

        .replace('assets/css/app.min.css', replacements)

        .copy([
            'resources/assets/bower_components/bootstrap/dist/fonts/**',
            'resources/assets/bower_components/font-awesome/fonts/**'
        ], 'assets/fonts/')

        .copy([
            'resources/assets/bower_components/iCheck/skins/square/blue.png',
            'resources/assets/bower_components/iCheck/skins/square/blue@2x.png'
        ], 'assets/images/')

        .task('sass')
        .task('scripts')
});

// compile sass
gulp.task('sass', function () {
    gulp.src('resources/assets/sass/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCss())
        .pipe(gulp.dest('./assets/css'));
});

gulp.task('scripts', function() {
    gulp.src('resources/assets/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./assets/js'));
});
```

这下问题就来了。

吃完饭回来，打算继续把项目改得更 Laravel Poi（就是尽量使用 Laravel 提供的服务的意思辣 =w=） 一些，然而在运行了 `$ gulp` 之后，却发现 `assets/js` 目录下没有输出 `app.min.js` 这个文件。

诶？WTF？上午不还是好好的嘛？

吓得我赶紧去 Google 看看有没有类似情况，看了一些回答感觉也是似而非，并没有用。虽然后来也有死马当活马医地把 Laravel Elixir 改为 5.0.0 版本，但还是屁用没有，非常的神秘。

在我把其他的 elixir tasks 都注释掉后，运行 gulp 的时候输出是这样的：

```
➜  blessing-skin-server git:(laravel) ✗ $ gulp
[18:02:22] Using gulpfile E:\wwwroot\blessing-skin-server\gulpfile.js
[18:02:22] Starting 'default'...
[18:02:22] Starting 'scripts'...
[18:02:22] Finished 'scripts' after 6.94 ms
[18:02:22] Finished 'default' after 8.77 ms
```

神 tm，就算你只是合并几个 js 文件，也不可能几毫秒就完成吧？同样的合并 css 文件的 task 也需要 500ms+ 才能完成。

看来八成是 Task 没被执行了，然而 `vendor_js` 数组里提供的文件路径都是存在的，所以应该不是找不到文件的问题（我后来也把提供给 `mix.scripts()` 的参数直接给了个肯定是存在的文件名，照样屁都没有生成）。

于是接下来我花了将近一个多小时的时间在边骂娘边尝试各种方法（elixir task 中间插不了其他语句，导致调试非常吃瘪），突然发现一处不对劲的地方：

```
➜  blessing-skin-server git:(laravel) ✗ $ ls -al assets/js
total 536
drwxr-xr-x 1 prpr prpr      0 Aug 28 17:03 .
drwxr-xr-x 1 prpr prpr      0 Aug 28 15:39 ..
-rw-r--r-- 1 prpr prpr   4583 Aug 28 17:05 auth.js
-rw-r--r-- 1 prpr prpr   6210 Aug 28 17:05 skinlib.js
-rw-r--r-- 1 prpr prpr  10515 Aug 28 17:05 user.js
-rw-r--r-- 1 prpr prpr   1545 Aug 28 17:05 utils.js
```

这几个 js 文件的最后修改日期竟然更新了！要知道为了单单调试 'mix.scripts()' 这个 task， 我把其他所有的 elixir tasks 都注释掉了，那么照理来说这几个 js 文件是不可能会被更新的。

到这里我们就快要发现这个坑的真相了。我仔细地看了一下出事时 gulp 的输出信息：

```
➜  blessing-skin-server git:(laravel) ✗ $ gulp
[17:52:48] Using gulpfile E:\wwwroot\blessing-skin-server\gulpfile.js
[17:52:48] Starting 'default'...
[17:52:48] Starting 'scripts'...
[17:52:48] Finished 'scripts' after 7.64 ms
[17:52:48] Starting 'styles'...

Fetching Styles Source Files...
   - resources\assets\bower_components\bootstrap\dist\css\bootstrap.min.css
   - resources\assets\bower_components\AdminLTE\dist\css\AdminLTE.min.css
   - resources\assets\bower_components\bootstrap-fileinput\css\fileinput.min.css
   - resources\assets\bower_components\font-awesome\css\font-awesome.min.css
   - resources\assets\bower_components\iCheck\skins\square\blue.css
   - resources\assets\bower_components\toastr\toastr.min.css
   - resources\assets\bower_components\sweetalert2\dist\sweetalert2.min.css


Saving To...
   - assets/css/app.min.css

[17:52:48] Finished 'default' after 569 ms
[17:52:48] gulp-notify: [Laravel Elixir] Stylesheets Merged!
[17:52:48] Finished 'styles' after 901 ms
[17:52:48] Starting 'replace'...

Fetching Replace Source Files...
   - assets/css/app.min.css

[17:52:48] Finished 'replace' after 15 ms
[17:52:48] Starting 'copy'...

Fetching Copy Source Files...
   - resources/assets/bower_components/bootstrap/dist/fonts/**/**/*
   - resources/assets/bower_components/font-awesome/fonts/**/**/*


Saving To...
   - assets/fonts/

[17:52:49] Finished 'copy' after 94 ms
[17:52:49] Starting 'copy'...

Fetching Copy Source Files...
   - resources/assets/bower_components/iCheck/skins/square/blue.png
   - resources/assets/bower_components/iCheck/skins/square/blue@2x.png


Saving To...
   - assets/images/

[17:52:49] Finished 'copy' after 5.27 ms
```

其他所有的 elixir tasks 都有一个 `Fetching Source Files` 和 `Saving To` 的日志，但是唯独 `scripts` 这个任务没有。我们再回头看一眼我们的 gulpfile.js：

```
gulp.task('scripts', function() {
    gulp.src('resources/assets/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./assets/js'));
});
```

Oh，Shit！我们有个自定义的原生 Gulp Task 也叫作 `scripts`！

看来 Laravel Elixir 内部实现机制应该是自动生成一个一个的 Gulp Task 并执行的（从上面 Elixir 输出中的任务名也可以推测出来），然而我们有个自定义 Task 的名字与 Elixir 自动生成的 Task 名一样，所以可能导致了我们写的自定义任务被调用，而不是调用所生成的 Elixir Task。

在我把自定义的那个 Gulp Task 更名为 `uglify` 后，一切都正常了：

```
➜  blessing-skin-server git:(laravel) ✗ $ gulp
[18:42:52] Using gulpfile E:\wwwroot\blessing-skin-server\gulpfile.js
[18:42:52] Starting 'default'...
[18:42:52] Starting 'scripts'...

Fetching Scripts Source Files...
   - resources\assets\bower_components\jquery\dist\jquery.min.js
   - resources\assets\bower_components\bootstrap\dist\js\bootstrap.min.js
   - resources\assets\bower_components\AdminLTE\dist\js\app.min.js
   - resources\assets\bower_components\bootstrap-fileinput\js\fileinput.min.js
   - resources\assets\bower_components\bootstrap-fileinput\js\locales\zh.js
   - resources\assets\bower_components\iCheck\icheck.min.js
   - resources\assets\bower_components\toastr\toastr.min.js
   - resources\assets\bower_components\sweetalert2\dist\sweetalert2.min.js
   - resources\assets\bower_components\es6-promise\es6-promise.min.js


Saving To...
   - assets/js/app.min.js

[18:42:52] Finished 'default' after 624 ms
[18:42:52] gulp-notify: [Laravel Elixir] Scripts Merged!
[18:42:52] Finished 'scripts' after 733 ms
[18:42:52] Starting 'styles'...

Fetching Styles Source Files...
   - resources\assets\bower_components\bootstrap\dist\css\bootstrap.min.css
   - resources\assets\bower_components\AdminLTE\dist\css\AdminLTE.min.css
   - resources\assets\bower_components\bootstrap-fileinput\css\fileinput.min.css
   - resources\assets\bower_components\font-awesome\css\font-awesome.min.css
   - resources\assets\bower_components\iCheck\skins\square\blue.css
   - resources\assets\bower_components\toastr\toastr.min.css
   - resources\assets\bower_components\sweetalert2\dist\sweetalert2.min.css


Saving To...
   - assets/css/app.min.css

[18:42:53] gulp-notify: [Laravel Elixir] Stylesheets Merged!
[18:42:53] Finished 'styles' after 448 ms
[18:42:53] Starting 'replace'...

Fetching Replace Source Files...
   - assets/css/app.min.css

[18:42:53] Finished 'replace' after 15 ms
[18:42:53] Starting 'copy'...

Fetching Copy Source Files...
   - resources/assets/bower_components/bootstrap/dist/fonts/**/**/*
   - resources/assets/bower_components/font-awesome/fonts/**/**/*


Saving To...
   - assets/fonts/

[18:42:53] Finished 'copy' after 89 ms
[18:42:53] Starting 'copy'...

Fetching Copy Source Files...
   - resources/assets/bower_components/iCheck/skins/square/blue.png
   - resources/assets/bower_components/iCheck/skins/square/blue@2x.png


Saving To...
   - assets/images/

[18:42:53] Finished 'copy' after 6.33 ms
[18:42:53] Starting 'task'...
[18:42:53] Starting 'sass'...
[18:42:53] Finished 'sass' after 2.96 ms
[18:42:53] Finished 'task' after 3.29 ms
[18:42:53] Starting 'task'...
[18:42:53] Starting 'uglify'...
[18:42:53] Finished 'uglify' after 956 μs
[18:42:53] Finished 'task' after 1.16 ms
```

目前已经给 Elixir 提了个 [issue](https://github.com/laravel/elixir/issues/622)，看看官方回复吧。

谨以此文记录，愿能帮到后来人 (;´Д`)



