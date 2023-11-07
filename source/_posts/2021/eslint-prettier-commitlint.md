---
title: '使用 ESLint + Prettier + Commitlint 规范代码风格与提交流程'
date: '2021-10-14 05:37:49'
updated: '2021-10-14 05:37:49'
categories: 技术
tags:
  - 前端
---

最近因为课程需要开了几个多人协作的新项目，感觉有必要在团队中强制一下代码规范，免得提交上来的东西对 leader 血压不好。前后端都是 TypeScript 的，所以就用流行的 ESLint + Prettier 组合拳（配合 [Standard](https://standardjs.com/) 规范），EditorConfig 同步编辑器配置，再加上 commitlint 规范提交信息，最后用 Git Hooks 实现自动化检查。

配置虽然不难，但还是有点繁琐的，所以记录一下，如果忘了下次可以翻回来看。

<!--more-->

## 简介

首先来介绍一下这些工具都是啥吧。

- [ESLint](https://eslint.org/)

ESLint 是一个插件化并且可配置的 JavaScript 语法规则和代码风格的检查工具，能够帮你轻松写出高质量的 JavaScript 代码。

简单来说就是可以静态分析代码中的问题（包括语法问题和代码风格问题，比如未使用的变量，`if` 和括号之间没有空格），给出提示，并且能够自动修复。

- [Prettier](https://prettier.io/)

Prettier 是一个“有态度” (opinionated) 的代码格式化工具。它支持大量编程语言，已集成到大多数编辑器中，且几乎不需要设置参数。

什么叫 opinionated？不同于 ESLint 什么都让你配置，Prettier 是一种严格规范的代码风格工具，主张尽量降低可配置性，严格规定组织代码的方式。

Prettier 只提供少量配置项，这么做的原因很简单：既然为停止争论而生，那么为何还需要设置更多选项让人们继续纠结于如何配置呢？

规矩就是这样，不服憋着。

- [commitlint](https://commitlint.js.org/)

检查你的 Git 提交信息是否符合配置的格式要求。

相信大家或多或少都见过某些人奔放不羁的 commit message，不仅给项目管理带来困难，看着也挺难受的。使用 commitlint 可以实现在提交前检查提交信息是否符合规范，配合 commitzen 食用更佳。

-----

看到这里你可能有些疑问，ESLint 可以自动修复代码风格问题，Prettier 也可以格式化代码，那它们两个不会打架吗？没错，确实会有冲突的情况，而这也是我们后面要解决的。

既然会冲突，那为什么要同时使用它们呢？主要有这几个原因：

- Prettier 的代码格式化能力更强。它的工作原理是把代码解析成 AST，然后根据规则重新输出，等于帮你整个儿**重写**了一遍代码。ESLint 的 `--fix` 自动修复虽然也可以实现一定程度的代码格式化，但没有 Prettier 效果好。
- Prettier 支持的文件格式更多，比如 HTML、CSS、JSON、Markdown 等等。

当然，如果 ESLint 对你来说已经够用，那么不加入 Prettier 其实也是完全没问题的。

## ESLint

这里我们采用 Standard 规范。

以 Vite 新建的 Vue 3 + TS 白板项目为例：

```bash
pnpm add -D \
	@typescript-eslint/eslint-plugin \
	@typescript-eslint/parser \
	eslint \
	eslint-config-standard-with-typescript \
	eslint-plugin-import \
	eslint-plugin-node \
	eslint-plugin-promise \
	eslint-plugin-vue
```

如果你的项目不使用 TypeScript，可以把 `eslint-config-standard-with-typescript` 规则替换为 `eslint-config-standard`。

```
"lint": "eslint \"src/**/*.{vue,ts,js}\" --fix"
```

.eslintrc.js

```javascript
module.exports = {
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    project: './tsconfig.json',
    extraFileExtensions: ['.vue']
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'standard-with-typescript',
    'plugin:vue/vue3-recommended'
  ],
  root: true,
  env: {
    node: true
  },
  rules: {
    'vue/script-setup-uses-vars': 'error',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off'
  },
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly'
  }
}
```

tsconfig.json

```json
{
  "compilerOptions": {
    "target": "esnext",
    "useDefineForClassFields": true,
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true,
    "jsx": "preserve",
    "sourceMap": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "lib": ["esnext", "dom"]
  },
  "include": [
    "src/**/*",
    ".eslintrc.js",
    "vite.config.ts"
  ]
}
```



## Prettier

需要注意的是，Prettier 和 Standard 规范并不完全兼容。

```
pnpm add -D \
	prettier \
	eslint-config-prettier \
	eslint-plugin-prettier
```

.eslintrc.js

```diff
 extends: [
   'plugin:@typescript-eslint/recommended',
   'standard-with-typescript',
   'plugin:vue/vue3-recommended',
+  'plugin:prettier/recommended'
 ],
```



.prettierrc

```
{
  "trailingComma": "none",
  "semi": false,
  "singleQuote": true
}
```



```
"lint": "eslint \"src/**/*.{vue,ts,js}\" --fix",
"format": "prettier --write \"src/**/*.{vue,ts,js}\""
```



## EditorConfig

自古以来，Tab or Space 就是不曾停歇的圣战。

不同成员都有不同的喜好，使用的编辑器/IDE 也不尽相同。那么为了 codebase 的规范，在所有项目成员中使用一个统一的配置是很有必要的。

```
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{js,jsx,ts,tsx,vue}]
indent_style = space
indent_size = 2
trim_trailing_whitespace = true
insert_final_newline = true

```



## Commitlint

比如很多项目都采用的 Conventional Commits 就要求提交信息必须符合以下规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

为什么要使用 Conventional Commits？

- 自动生成 CHANGELOG
- 基于提交类型生成语义化版本号
- 项目提交历史更清晰

## Git Hooks

【鸽了】

反正就是让上面那些工具可以在 Git 提交时自动执行，检查不通过的就打回。


## 最后

还记得很久以前别人给我发了个 Pull Request，我一看，发现有好多地方的代码风格都和我不一样，比如单双引号、分号的使用，还有我最不能忍的 `if(xxx){}` 之间不加空格……

但我想想再叫人家改也怪麻烦的，就默默接受了 PR，然后再默默改成自己的代码风格……

现在有了这些东西工作流程就规范多了：

- 你乱写也行，我直接给你格式化掉；
- 语法检查，在编写过程中就排除潜在的 BUG；
- 提交上来的代码必须通过以上验证，不然就拒绝；
- 提交信息也要规范，不能瞎写乱写。

当然了，规矩是死的人是活的，这一套下来也没法保证一定万无一失。不过相比以前群魔乱舞的场面，已经省心了不少。

不过说实在话，比起配置这些工具，推行一个大家都能接受的规范才更难吧（x）

