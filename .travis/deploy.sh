#!/bin/bash
set -ev
export TZ='Asia/Shanghai'

# 先 clone 再 commit，避免直接 force commit
git clone -b master git@github.com:printempw/printempw.github.io.git .deploy_git

cd .deploy_git
git checkout master
cp -r ../public/* ./

git add .
git commit -m "Site updated: `date +"%Y-%m-%d %H:%M:%S"`"

# 同时 push 一份到自己的服务器上
git remote add vps git@prinzeugen.net:hexo.git

git push vps master:master --force --quiet
git push origin master:master --force --quiet
