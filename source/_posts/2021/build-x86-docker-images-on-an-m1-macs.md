---
title: '在 M1 Mac 上构建 x86 Docker 镜像'
date: '2021-02-17 05:38:00'
updated: '2021-02-17 05:38:00'
categories: 技术
tags:
  - Docker
  - Mac
---

今天闲来无事，数了一下服务器上在跑的东西，打算把它们都扔到 Docker 里面去。第一个开刀的就是之前写的 [Google Analytics 博客阅读量统计](https://prinsss.github.io/google-analytics-api-page-views-counter/)，很简单的一个 Node.js + Express 程序。

写完 [Dockerfile](https://github.com/printempw/google-analytics-hit-counter) 测试好，正准备 push 上去时，我才突然想起来：

我现在用的是 M1 MacBook，**丫的默认 build 出来的镜像是 `arm64` 架构的呀！**

<!--more-->

好在 M1 Mac 上的 [Docker Tech Preview](https://docs.docker.com/docker-for-mac/apple-m1/) 也支持使用 [buildx](https://docs.docker.com/buildx/working-with-buildx/) 构建多架构的镜像，稍微设置一下就可以了。

> 题外话，M1 MacBook Air 真的很好用，建议早买早享受（

## 启用实验性功能

Docker 的 `buildx` 还是实验性功能，需要在 Docker Desktop 设置中开启，具体位于 *Preferences > Experimental Features > Enable CLI experimental features*。

## 新建 builder 实例

Docker 默认的 builder 不支持同时指定多个架构，所以要新建一个：

```bash
docker buildx create --use --name m1_builder
```

查看并启动 builder 实例：

```bash
docker buildx inspect --bootstrap
```

```text
Name:   m1_builder
Driver: docker-container

Nodes:
Name:      m1_builder0
Endpoint:  unix:///var/run/docker.sock
Status:    running
Platforms: linux/arm64, linux/amd64, linux/riscv64, linux/ppc64le, linux/s390x, linux/arm/v7, linux/arm/v6
```

其中 platforms 就是支持的架构，跨平台构建的底层是用 QEMU 实现的。

## 构建多架构 Docker 镜像

使用 `buildx` 构建：

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64
  --push -t printempw/google-analytics-hit-counter .
```

其中 `-t` 参数指定远程仓库，`--push` 表示将构建好的镜像推送到 Docker 仓库。如果不想直接推送，也可以改成 `--load`，即将构建结果加载到镜像列表中。

`--platform` 参数就是要构建的目标平台，这里我就选了本机的 `arm64` 和服务器用的 `amd64`。最后的 `.`（构建路径）注意不要忘了加。

构建完 push 上去以后，可以查看远程仓库的 manifest：

```bash
docker buildx imagetools inspect printempw/google-analytics-hit-counter
```

```text
Name:      docker.io/printempw/google-analytics-hit-counter:latest
MediaType: application/vnd.docker.distribution.manifest.list.v2+json
Digest:    sha256:a9a8d097abb4fce257ae065365be19accebce7d95df58142d6332270cb3e3478

Manifests:
  Name:      docker.io/printempw/google-analytics-hit-counter:latest@sha256:bb7f3a996b66a1038de77db9289215ef01b18e685587e2ec4bb0a6403cc7ce78
  MediaType: application/vnd.docker.distribution.manifest.v2+json
  Platform:  linux/amd64

  Name:      docker.io/printempw/google-analytics-hit-counter:latest@sha256:94ea08ac45f38860254e5de2bae77dee6288dd7c9404d8da8a3578d6912e68e7
  MediaType: application/vnd.docker.distribution.manifest.v2+json
  Platform:  linux/arm64
```

可以看到已经是支持多架构的镜像了。

## 参考链接

- [How to build x86 (and others!) Docker images on an M1 Mac - Jaimyn Mayer's Blog](https://jaimyn.com.au/how-to-build-multi-architecture-docker-images-on-an-m1-mac/#tldr;)
- [How to Actually Deploy Docker Images Built on M1 Macs With Apple Silicon | by Jon Vogel](https://medium.com/better-programming/how-to-actually-deploy-docker-images-built-on-a-m1-macs-with-apple-silicon-a35e39318e97)
- [使用 buildx 构建多种系统架构支持的 Docker 镜像 - Docker —— 从入门到实践](https://yeasy.gitbook.io/docker_practice/buildx/multi-arch-images)
