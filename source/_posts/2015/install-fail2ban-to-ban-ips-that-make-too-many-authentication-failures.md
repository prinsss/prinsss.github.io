---
title: '安装 fail2ban 防止 SSH 暴力破解'
date: '2015-08-16 05:26:29'
updated: '2015-08-29 00:34:52'
categories: 技术
tags:
  - 运维
---


窝一直天真的以为不会有人暴力破解窝的，直到今天看了一下 `grep sshd /var/log/auth.log` 。。

![log](https://img.prin.studio/images/2015/08/2015-08-15_12-49-38.png)

防止 ssh 暴力破解大概就是使用 ssh key，改端口，关闭口令登录，还有就是 fail2ban，denyhost 之类的软件了，这里窝打算使用 fail2ban。项目地址：[GitHub](https://github.com/fail2ban/fail2ban)，官网：[http://www.fail2ban.org/](http://www.fail2ban.org/)

```
__      _ _ ___ _
/ _|__ _(_) |_  ) |__  __ _ _ _
|  _/ _` | | |/ /| '_ \/ _` | ' \
|_| \__,_|_|_/___|_.__/\__,_|_||_|
v0.9.3.dev              2015/XX/XX
```


> 简介：Fail2Ban scans log files like /var/log/pwdfail and bans IP that makes too many password failures. It updates firewall rules to reject the IP address. These rules can be defined by the user. Fail2Ban can read multiple log files such as sshd or Apache web server ones.

### 1. 安装

安装可以源码编译安装也可以直接包管理器安装，Ubuntu 软件仓库中已经添加了 fail2ban，直接 apt-get 即可。源码编译安装请参照官方项目 README。

```
$ sudo apt-get update
$ sudo apt-get install fail2ban
```

### 2. 基本配置

安装完成后 fail2ban 的配置文件可以在 `/etc/fail2ban/` 中找到，其中：

```
/etc/fail2ban/fail2ban.conf  #fail2ban 的配置文件
/etc/fail2ban/jail.conf  #一个 filter 或者多个 action 的组合，阻挡设定文件
/etc/fail2ban/filter.d/  #过滤器，具体过滤规则文件目录
/etc/fail2ban/action.d/  #操作，检测到后采取相对应措施的目录
```

fail2ban 中已经内置常用软件的过滤规则，如 ssh，ftp 等，在 `/etc/fail2ban/jail.conf` 中配置为 enable 即可

![jail](https://img.prin.studio/images/2015/08/2015-08-15_13-19-37.png)

另外如果需要自定义 filter 的话需要正则表达式知识，这里就不多说了，自带的对于防范 ssh 暴力破解已经够用了

```
启动|关闭|状态|重启 fail2ban： `service fail2ban {start|stop|status|restart}`
```

下面讲一下如何对 fail2ban 的默认配置进行调整

### 3. 进阶配置

首先，将默认配置 `/etc/fail2ban/jail.conf` 拷贝一份为 `jail.local`

注意，`*.local` 中的配置会覆盖掉 `*.conf` 中的配置

```shell
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

编辑它

```
sudo vim /etc/fail2ban/jail.local

In this file, there are a few settings you may wish to adjust. The settings located under the [DEFAULT] section will be applied to all services enabled for fail2ban that are not overridden in the service’s own section.

ignoreip = 127.0.0.1/8

You can adjust the source addresses that fail2ban ignores by adding a value to the ignoreip parameter. Currently, it is configured not ban any traffic coming from the local machine. You can add additional addresses to ignore by appending them to the end of the parameter, separated by a space.

bantime = 600

The bantime parameter sets length of time that a client will be banned when they have failed to authenticate correctly. This is measured in seconds. By default, this is set to 600 seconds, or 10 minutes.

findtime = 600 maxretry = 3

The next two parameters that you want to pay attention to are findtime and maxretry. These work together to establish the conditions under which a client is found to be an illegitimate user that should be banned.

The maxretry variable sets the number of tries a client has to authenticate within a window of time defined by findtime, before being banned. With the default settings, the fail2ban service will ban a client that unsuccessfully attempts to log in 3 times within a 10 minute window.

destemail = root@localhost sendername = Fail2Ban mta = sendmail

Some other settings you may wish to are the destemail, sendername, and mta settings if you wish to configure email alerts. The destemail parameter sets the email address that should receive ban messages. The sendername sets the value of the “From” field in the email. The mta parameter configures what mail service will be used to send mail.

action = $(action_)s

This parameter configures the action that fail2ban takes when it wants to institute a ban. The value action_ is defined in the file shortly before this parameter. The default action is to simply configure the firewall to reject traffic from the offending host until the ban time elapses.

If you would like to configure email alerts, you can change the value from action_ to action_mw. If you want the email to include the relevant log lines, you can change it to action_mwl. Make sure you have the appropriate mail settings configured if you choose to use mail alerts.
```

### 4. 测试一下？

现在窝们的 fail2ban 已经配置好了，是时候作死一波了（反正重新拨号就换 IP 怕啥

根据 `/etc/fail2ban/jail.conf` 中 `ssh` 的配置，只要窝们登录失败六次错误就会被 ban 掉 IP，那么就让窝祭出 cmd 大法来 ssh 登录吧！

![em1](https://img.prin.studio/images/2015/08/2015-08-12_12-42-14.jpg)

测试结果明天更吧~

### 5. 参考资料

[https://github.com/fail2ban/fail2ban/blob/master/README.md](https://github.com/fail2ban/fail2ban/blob/master/README.md)

[http://drops.wooyun.org/tips/3029](http://drops.wooyun.org/tips/3029)

[http://my.oschina.net/lijialong/blog/109497](http://my.oschina.net/lijialong/blog/109497)

[https://www.digitalocean.com/community/tutorials/how-to-protect-ssh-with-fail2ban-on-ubuntu-14-04?utm_medium=community&utm_source=newsletter&utm_campaign=8272015](https://www.digitalocean.com/community/tutorials/how-to-protect-ssh-with-fail2ban-on-ubuntu-14-04?utm_medium=community&utm_source=newsletter&utm_campaign=8272015)

### 6. UPDATE LOG：

8.28 使用分页和 bootstrap 对教程重新排版；添加了一些内容
