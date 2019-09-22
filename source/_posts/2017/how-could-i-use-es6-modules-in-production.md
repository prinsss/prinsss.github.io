---
title: 我 TMD 到底要怎样才能在生产环境中用上 ES6 模块化？
date: 2017-07-06 16:57:23
updated: 2017-07-06 16:57:23
categories: 技术
tags:
  - JavaScript
  - 前端

---

Python3 已经发布了九年了，Python 社区却还在用 Python 2.7；而 JavaScript 社区正好相反，大家都已经开始把还没有实现的语言特性用到生产环境中了 (´_ゝ `)

虽然这种奇妙情况的形成与 JavaScript 自身早期的设计缺陷以及浏览器平台的特殊性质都有关系，但也确实能够体现出 JavaScript 社区的技术栈迭代是有多么屌快。如果你昏迷个一年半载再去看前端圈，可能社区的主流技术栈已经变得它妈都不认识了（如果你没什么实感，可以看看[《在 2016 年学习 JavaScript 是一种怎样的体验》](https://zhuanlan.zhihu.com/p/22782487)这篇文章，你会感受到的，你会的）。

## JavaScript 模块化现状

随着 JavaScript 越来越广泛的应用，朝着单页应用（SPA）方向发展的网页与代码量的愈发庞大，社区需要一种更好的代码组织形式，这就是模块化：将你的一大坨代码分装为多个不同的模块。

但是在 ES6 标准出台之前，由于标准的缺失（连 CSS 都有 `@import`，JavaScript 却连个毛线都没），这几年里 JavaScript 社区里冒出了各种各样的模块化解决方案~~（群魔乱舞）~~，懵到一种极致。主要的几种模块化方案举例如下：

### CommonJS

主要用于服务端，模块同步加载（也因此不适合在浏览器中运行，不过也有 `Browserify` 之类的转换工具），Node.js 的模块化实现就是基于 CommonJS 规范的，通常用法像这样：

<!--more-->

```javascript
// index.js
const {bullshit} = require('./bullshit');
console.log(bullshit());

// bullshit.js
function someBullshit() {
  return "hafu hafu";
}

modules.export = {
  bullshit: someBullshit
};
```

而且 `require()` 是动态加载模块的，完全就是模块中 `modules.export` 变量的传送门，这也就意味着更好的灵活性（按条件加载模块，参数可为表达式 etc.）。

### AMD

即异步模块定义（Asynchronous Module Definition），~~不是那个日常翻身的农企啦~~。

主要用于浏览器端，模块异步加载（还是用的回调函数），可以给模块注入依赖、动态加载代码块等。具体实现有 RequireJS，代码大概长这样：

```javascript
// index.js
require(['bullshit'], words => {
  console.log(words.bullshit());
});

// bullshit.js
define('bullshit', ['dep1', 'dep2'], (dep1, dep2) => {
  function someBullshit() {
    return "hafu hafu";
  }

  return { bullshit: someBullshit };
});
```

可惜不能在 Node.js 中直接使用，而且模块定义与加载也比较冗长。

### ES6 Module🚀

在 ES6 模块标准出来之前，主要的模块化方案就是上述 CommonJS 和 AMD 两种了，一种用于服务器，一种用于浏览器。其他的规范还有：

- 最古老的 IIFE（立即执行函数）；
- CMD（Common Module Definition，和 AMD 挺像的，可以参考：[与 RequireJS 的异同](https://github.com/seajs/seajs/issues/277)）；
- UMD（Universal Module Definition，兼容 AMD 和 CommonJS 的语法糖规范）；

等等，这里就按下不表。

ES6 的模块化代码大概长这样：

```javascript
// index.js
import {bullshit} from './bullshit';
console.log(bullshit());

// bullshit.js
function someBullshit() {
  return "hafu hafu";
}

export {
  someBullshit as bullshit
};
```

那我们为啥应该使用 ES6 的模块化规范呢？

- 这是 ECMAScript 官方标准（嗯）；
- 语义化的语法，清晰明了，同时支持服务器端和浏览器；
- 静态 / 编译时加载（与上面俩规范的动态 / 运行时加载不同），可以做静态优化（比如下面提到的 tree-shaking），加载效率高（不过相应地灵活性也降低了，期待 [`import()`](https://github.com/tc39/proposal-dynamic-import) 也成为规范）；
- 输出的是值的引用，可动态修改；

嗯，你说的都对，那我tm到底要怎样才能在生产环境中用上 ES6 的模块化特性呢？

很遗憾，你永远无法控制用户的浏览器版本，可能要等上一万年，你才能直接在生产环境中写 ES6 而不用提心吊胆地担心兼容性问题。因此，你还是需要各种各样杂七杂八的工具来转换你的代码：Babel、Webpack、Browserify、Gulp、Rollup.js、System.js ……

噢，我可去你妈的吧，这些东西都tm是干嘛的？我就是想用个模块化，我到底该用啥子？

![我可去你妈的吧](https://img.blessing.studio/images/2017/07/06/QQ20170706155858.jpg)

本文正旨在列出几种可用的在生产环境中放心使用 ES6 模块化的方法，希望能帮到诸位后来者（这方面的中文资源实在是忒少了）。

## 问题分析

想要开心地写 ES6 的模块化代码，首先你需要一个转译器（Transpiler）来把你的 ES6 代码转换成大部分浏览器都支持的 ES5 代码。这里我们就选用最多人用的 Babel（我不久之前才知道原来 Babel 就是巴别塔里的「巴别」……）。

用了 Babel 后，我们的 ES6 模块化代码会被转换为 ES5 + CommonJS 模块规范的代码，这倒也没什么，毕竟我们写的还是 ES6 的模块，至于编译生成的结果，管它是个什么屌东西呢（笑）

所以我们需要另外一个打包工具来将我们的模块依赖给打包成一个 bundle 文件。目前来说，依赖打包应该是最好的方法了。不然，你也可以等上一万年，等你的用户把浏览器升级到全部支持 HTTP/2（支持连接复用后模块不打包反而比较好）以及 `<script type="module" src="fuck.js">` 定义 ( ﾟ∀。)

所以我们整个工具链应该是这样的：

![处理流程](https://img.blessing.studio/images/2017/07/06/snipaste_20170706_104001.png)

而目前来看，主要可用的模块打包工具有这么几个：

- Browserify
- Webpack
- Rollup.js

本来我还想讲一下 FIS3 的，结果去看了一下，人家竟然还没原生的支持 ES6 Modules，而且 `fis3-hook-commonjs` 插件也几万年没更新了，所以还是算了吧。至于 SystemJS 这类动态模块加载器本文也不会涉及，就像我上面说的一样，在目前这个时间点上还是先用模块打包工具比较好。

下面分别介绍这几个工具以及如何使用它们配合 Babel 实现 ES6 模块转译。

## Browserify

Browserify 这个工具也是有些年头了，它通过打包所有的依赖来让你能够在浏览器中使用 CommonJS 的语法来 `require('modules')`，这样你就可以像在 Node.js 中一样在浏览器中使用 npm 包了，可以爽到。

<img src="https://img.blessing.studio/images/2017/07/06/browserify.png" class="head-img" title="而且我也很喜欢 Browserify 这个 LOGO">

既然 Babel 会把我们的 ES6 Modules 语法转换成 ES5 + CommonJS 规范的模块语法，那我们就可以直接用 Browserify 来解析 Babel 的转译生成物，然后把所有的依赖给打包成一个文件，岂不是美滋滋。

不过除了 Babel 和 Browserify 这俩工具外，我们还需要一个叫做 `babelify` 的东西……好吧好吧，这是最后一个了，真的。

那么，babelify 是拿来干嘛的呢？因为 Browserify 只看得懂 CommonJS 的模块代码，所以我们得把 ES6 模块代码转换成 CommonJS 规范的，再拿给 Browserify 去看：这一步就是 Babel 要干的事情了。但是 Browserify 人家是个模块打包工具啊，它是要去分析 AST（抽象语法树），把那些 `reuqire()` 的依赖文件给找出来再帮你打包的，你总不能把所有的源文件都给 Babel 转译了再交给 Browserify 吧？那太蠢了，我的朋友。

`babelify` (Browserify transform for Babel) 要做的事情，就是在所有 ES6 文件拿给 Browserify 看之前，先把它用 Babel 给转译一下（`browserify().transform`），这样 Browserify 就可以直接看得懂并打包依赖，避免了要用 Babel 先转译一万个文件的尴尬局面。

好吧，那我们要怎样把这些工具捣鼓成一个完整的工具链呢？下面就是喜闻乐见的依赖包安装环节：

```shell
# 我用的 yarn，你用 npm 也差不多
# gulp 也可以全局安装，方便一点
# babel-preset 记得选适合自己的
# 最后那俩是用来配合 gulp stream 的
$ yarn add --dev babel-cli babel-preset-env babelify browserify gulp vinyl-buffer vinyl-source-stream
```

这里我们用 Gulp 作为任务管理工具来实现自动化（什么，都 7012 年了你还不知道 Gulp？那为什么不去问问[神奇海螺](https://www.google.com/)呢？），`gulpfile.js` 内容如下：

```javascript
var gulp       = require('gulp'),
    browserify = require('browserify'),
    babelify   = require('babelify'),
    source     = require('vinyl-source-stream'),
    buffer     = require('vinyl-buffer');

gulp.task('build', function () {
    return browserify(['./src/index.js'])
        .transform(babelify)
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('dist'))
        .pipe(buffer());
});
```

相信诸位都能看得懂吧，`browserify()` 第一个参数是入口文件，可以是数组或者其他乱七八糟的，具体参数说明请自行参照 Browserify 文档。而且记得在根目录下创建 `.babelrc` 文件指定转译的 preset，或者在 `gulpfile.js` 中配置也可以，这里就不再赘述。

最后运行 `gulp build`，就可以生成能直接在浏览器中运行的打包文件了。

```shell
➜  browserify $ gulp build
[12:12:01] Using gulpfile E:\wwwroot\es6-module-test\browserify\gulpfile.js
[12:12:01] Starting 'build'...
[12:12:01] Finished 'build' after 720 ms
```

![Browserify Result](https://img.blessing.studio/images/2017/07/06/snipaste_20170706_111125.png)

## Rollup.js

我记得这玩意最开始出来的时候号称为「下一代的模块打包工具」，并且自带了可大大减小打包体积的 `tree-shaking` 技术（DCE 无用代码移除的一种，运用了 ES6 静态分析语法树的特性，只打包那些用到了的代码），在当时很新鲜。

![Rollup.js](https://img.blessing.studio/images/2017/07/06/rollupjs.jpg)

但是现在 Webpack2+ 已经支持了 Tree Shaking 的情况下，我们又有什么特别的理由去使用 Rollup.js 呢？不过毕竟也是一种可行的方法，这里也提一提：

```shell
# 我也不知道为啥 Rollup.js 要依赖这个 external-helpers
$ yarn add --dev rollup rollup-plugin-babel babel-preset-env babel-plugin-external-helpers
```

然后修改根目录下的 `rollup.config.js`：

```javascript
import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/index.js',
  format: 'esm',
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ],
  dest: 'dist/bundle.js'
};
```

还要修改 `.babelrc` 文件，把 Babel 转换 ES6 模块到 CommonJS 模块的转换给关掉，不然会导致 Rollup.js 处理不来：

```json
{
  "presets": [
    ["env", {
      "modules": false
    }]
  ],
  "plugins": [
    "external-helpers"
  ]
}
```

然后在根目录下运行 `rollup -c` 即可打包依赖，也可以配合 Gulp 来使用，官方文档里就有，这里就不赘述了。可以看到，Tree Shaking 的效果还是很显著的，经测试，未使用的代码确实不会被打包进去，比起上面几个工具生成的结果要清爽多了：

![Rollup.js Result](https://img.blessing.studio/images/2017/07/06/snipaste_20170706_140641.png)

## Webpack

对，Webpack，就是那个丧心病狂想要把啥玩意都给模块化的模块打包工具。既然人家已经到了 `3.0.0` 版本了，所以下面的都是基于 Webpack3 的。什么？现在还有搞前端的不知道 Webpack？神奇海螺以下略。

![Webpack](https://img.blessing.studio/images/2017/07/06/webpack.png)

喜闻乐见的依赖安装环节：

```shell
# webpack 也可以全局安装，方便一些
$ yarn add --dev babel-loader babel-core babel-preset-env webpack
```

然后配置 `webpack.config.js`：

```javascript
var path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }
    ]
  }
};
```

差不多就是这么个配置，`babel-loader` 的其他 `options` 请参照文档，而且这个配置文件的括号嵌套也是说不出话，ZTMJLWC。

然后运行 `webpack`：

```shell
➜  webpack $ webpack
Hash: 5c326572cf1440dbdf64
Version: webpack 3.0.0
Time: 1194ms
    Asset     Size  Chunks             Chunk Names
bundle.js  2.86 kB       0  [emitted]  main
   [0] ./src/index.js 106 bytes {0} [built]
   [1] ./src/bullshit.js 178 bytes {0} [built]
```

情况呢就是这么个情况：

![Webpack Result](https://img.blessing.studio/images/2017/07/06/snipaste_20170706_114129.png)

{% alert info %}
**Tips: 关于 Webpack 的 Tree Shaking**

Webpack 现在是自带 Tree-Shaking 的，不过需要你把 Babel 默认的转换 ES6 模块至 CommonJS 格式给关掉，就像上面 Rollup.js 那样在 `.babelrc` 中添加个 `"modules": false`。原因的话上面也提到过，tree-shaking 是基于 ES6 模块的静态语法分析的，如果交给 Webpack 的是已经被 Babel 转换成 CommonJS 的代码的话那就没戏了。

而且 Webpack 自带的 tree-shaking 只是把没用到的模块从 `export` 中去掉而已，之后还要再接一个 UglifyJS 之类的工具把冗余代码干掉才能达到 Rollup.js 那样的效果。
{% endalert %}

Webpack 也可以配合 Gulp 工作流让开发更嗨皮，有兴趣的可自行研究。目前来看，这三种方案中，我本人更倾向于使用 Webpack，不知道诸君会选用什么呢？

## 写在后面

前几天我在捣鼓 [printempw/blessing-skin-server](https://github.com/printempw/blessing-skin-server) 那坨 shi 一样 JavaScript 代码的模块化的时候，打算试着使用一下 ES6 标准中的模块化方案，并找了 Google 大老师问 ES6 模块转译打包相关的资源，找了半天，几乎没有什么像样的中文资源。全是讲 ES6 模块是啥、有多好、为什么要用之类的，没几个是讲到底该怎么在生产环境中使用的（也有可能是我搜索姿势不对），说不出话。遂撰此文，希望能帮到后来人。

且本人水平有限，如果文中有什么错误，欢迎在下方评论区批评指出。

### 参考链接

- [Getting import/export working ES6 style using Browserify + Babelify + Gulp = -5hrs of life](Getting import/export working ES6 style using Browserify + Babelify + Gulp = -5hrs of life)
- [rollup.js • guide](https://rollupjs.org/)
- [使用 webpack 2 tree-shaking 机制时需要注意的细节](http://brooch.me/2017/06/30/webpack-tree-shaking/)
- [webpack+babel 加载 es6 模块](http://xwjgo.github.io/2016/09/23/webpack+babel%E5%AE%9E%E7%8E%B0%E5%9C%A8%E6%B5%8F%E8%A7%88%E5%99%A8%E7%AB%AF%E4%BD%BF%E7%94%A8es6%E6%A8%A1%E5%9D%97%E8%AF%AD%E6%B3%95/)
- [Documentation - webpack](https://webpack.js.org/configuration/)
- [如何评价 Webpack 2 新引入的 Tree-shaking 代码优化技术？](https://www.zhihu.com/question/41922432)

