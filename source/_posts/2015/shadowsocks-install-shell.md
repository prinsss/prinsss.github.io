---
title: '写了个 shadowsocks 一键安装脚本'
date: '2015-08-13 01:26:42'
updated: '2015-08-13 02:54:43'
categories: 技术
tags:
  - shadowsocks
  - Shell
---

> 从 WordPress 迁移至 Ghost 时把代码样式都给弄乱了，换行全都被吞掉了，不过我也懒得再去修复就是了（反正原来的代码也很屎）。

窝最近由于一些需求所以经常要在 VPS 上安装 shadowsocks，但是每一次都按照窝以前写的[那篇文章](https://prinzeugen.net/vps-ubuntu-shadowsocks/)那样一个个配置真是有够麻烦，虽然别人早就写了很多比窝这个更好的脚本，但是感觉比较臃肿，比较窝的需求也就那么点。正好可以学习学习写 shell 嘛~ (｀･ω･)

注意，这个脚本**只适用于 Ubuntu**，而且窝几乎一点 排错/DEBUG 代码都没有写，如果你真的想用那就用吧（没错写这篇文只是为了水一发 ![20150715224933](https://img.blessing.studio/images/2015/07/2015-07-15_14-49-46.jpg) 并不觉得有人会用。

下面贴代码：<!--more-->

#! /bin/bash #================================== # AUTHOR: printempw # NOTE: I HAVEN'T WRITE ANY DEBUG CODE IN THIS SHELL, # IF ANY ERROR RAISES,UMM,JUST LET IT GO # SYSTEM REQUIRED: ONLY FOR UBUNTU #================================== clear echo "" echo "=======================================" echo "= NOW START TO INSTALL SHADOWSOCKS =" echo "= NOTE: PLEASE RUN THIS SHELL AS ROOT =" echo "=======================================" echo "" echo "Press any key to install or Press Ctrl+C to cancel" #PORT echo "Please input the port for shadowsocks [1-65535]:" read -p "(Default port: 62100):" ss_port [ -z "$ss_port" ] && ss_port="62100" if [ $ss_port -ge 1 ] && [ $ss_port -le 65535 ]; then echo "" echo "====================================" echo "= port = $ss_port " echo "====================================" echo "" break else echo "NOT AVAILABLE PORT NUMBER" fi #PASSWORD echo "Please input the password for shadowsocks:" read -p "(Default password: prinzeugen.net):" ss_passwd [ -z "$ss_passwd" ] && ss_passwd="prinzeugen.net" echo "" echo "====================================" echo "= password : $ss_passwd " echo "====================================" echo "" #ENABLE FAST OPEN echo "" echo "Do you want to enable fast_open?(true/false)" read -p "(Default: false):" ss_fastopen [ -z "$ss_fastopen" ] && ss_open="false" #INSTALL DEPENDENCIES apt-get update -y apt-get install python-pip supervisor -y #CONFIG SHADOWSOCKS.JSON cat > /etc/shadowsocks.json<<-EOF { "server":"::", "server_port":${ss_port}, "local_port":1080, "password":"${ss_passwd}", "timeout":300, "method":"rc4-md5", "fast_open":${ss_fastopen} } EOF #CONFIG SUPERVISOR cat > /etc/supervisor/conf.d/shadowsocks.conf<<-EOF [program:shadowsocks] command=ssserver -c /etc/shadowsocks.json autorestart=true user=nobody EOF echo "ulimit -n 51200" >> /etc/default/supervisor #SET IPTABLES iptables -I INPUT -p tcp -m tcp --dport ${ss_port} -j ACCEPT iptables-save iptables restart #INSTALL SHADOWSOCKS pip install shadowsocks #START SHADOWSOCKS service supervisor start supervisorctl reload supervisorctl restart shadowsocks echo "" echo "====================================" echo "= INSTALLITION DONE =" echo "= ENJOY IT =" echo "====================================" echo ""
