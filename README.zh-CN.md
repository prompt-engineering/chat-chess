# ChatChess - ChatGPT 国际象棋和解说

[![ci](https://github.com/prompt-engineering/chat-chess/actions/workflows/ci.yml/badge.svg)](https://github.com/prompt-engineering/chat-chess/actions/workflows/ci.yml)
![GitHub](https://img.shields.io/github/license/prompt-engineering/chat-chess)

演示: WIP

![截图](https://chatchessassets.s3.ap-east-1.amazonaws.com/screenshots/Screenshot+2023-04-26+at+19.16.29.png)

[English](./README.md) | 简体中文

## 本地搭建

### 请注意 ChatGPT 会随机给出不符合规则的棋，服务器会无限重复调用 OpenAI 直到得到符合规则的结果。如果你是付费用户，这些请求都会计费。

1. 从 GitHub 克隆 [ChatChess](https://github.com/prompt-engineering/chat-chess)。
2. 执行 `npm install`
3. 运行 `npm run dev` 开启前端
4. 新建控制台，进入 `server` 文件夹
5. 执行 `npm install`
6. 运行 `npm run start` 开启后端

## LICENSE

This code is distributed under the MIT license. See [LICENSE](./LICENSE) in this directory.
