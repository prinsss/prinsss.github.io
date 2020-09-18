---
title: '自定义 Zsh 提示符'
date: '2015-11-22 19:48:23'
updated: '2015-12-06 02:08:03'
categories: 技术
tags:
  - 工具
  - Shell
---


babun 内建的 zsh 默认使用的是 `babun` 主题，就长这样：

[![babun1](https://img.prin.studio/images/2015/11/2015-11-22_01-18-44.png)](https://img.prin.studio/images/2015/11/2015-11-22_01-18-44.png)

换主题时看中了 oh-my-zsh 默认主题 `robbyrussell`，然而这个主题并没有窝喜欢的 `$` 提示符，只好自己动手修改啦

这是修改后的效果：

[![babun2](https://img.prin.studio/images/2015/11/2015-11-22_01-25-48.png)](https://img.prin.studio/images/2015/11/2015-11-22_01-25-48.png)

关于 zsh 自定义前缀，网上似乎没有中文教程呢，有时间的话翻译一下吧（有生之年

[How to Customize Your Command Prompt](http://code.tutsplus.com/tutorials/how-to-customize-your-command-prompt--net-24083)

这是修改后的主题内容：

local ret_status="%(?:%{$fg_bold[green]%}➜ :%{$fg_bold[red]%}➜ %s)" PROMPT='${ret_status}%{$fg_bold[green]%}%p %{$fg[cyan]%}%c %{$fg_bold[blue]%}$(git_prompt_info)%{$fg_bold[blue]%}%{$reset_color%}%{$fg_bold[blue]%}$ %{$reset_color%}' ZSH_THEME_GIT_PROMPT_PREFIX="git:(%{$fg[red]%}" ZSH_THEME_GIT_PROMPT_SUFFIX="%{$reset_color%}" ZSH_THEME_GIT_PROMPT_DIRTY="%{$fg[blue]%}) %{$fg[yellow]%}✗ %{$reset_color%}" ZSH_THEME_GIT_PROMPT_CLEAN="%{$fg[blue]%})"

在 `~/.oh-my-zsh/themes` 下新建个以 `.zsh-theme` 为扩展名的文件，把上面的内容复制进去。

或者你可以直接 <span class="lang:sh decode:true crayon-inline ">$ wget https://files.prinzeugen.net/Archive/robbyrussell-makaizou.zsh-theme</span>

然后编辑 `~/.zshrc`，将 `ZSH_THEME` 改为所修改主题的文件名

[![zshrc](https://img.prin.studio/images/2015/11/2015-11-22_03-44-07.png)](https://img.prin.studio/images/2015/11/2015-11-22_03-44-07.png)

重启终端就可以看到效果辣 XDD



