#!/bin/bash
set -ev
export TZ='Asia/Shanghai'

# 先 clone 再 commit，避免直接 force commit
git clone -b master git@github.com:printempw/printempw.github.io.git .deploy_git

cd .deploy_git
git checkout master
rm -rf ./
cp -r ../public/* ./

git add .
git commit -m "Site updated: `date +"%Y-%m-%d %H:%M:%S"`"

git push origin master:master --force --quiet
