# ChatChess - Chess AI and commentary powered by ChatGPT

[![ci](https://github.com/prompt-engineering/chat-chess/actions/workflows/ci.yml/badge.svg)](https://github.com/prompt-engineering/chat-chess/actions/workflows/ci.yml)
![GitHub](https://img.shields.io/github/license/prompt-engineering/chat-chess)
[![Discord](https://img.shields.io/discord/1082563233593966612)](https://discord.gg/FSWXq4DmEj)

English | [简体中文](./README.zh-CN.md)

Online Demo: WIP

![Screenshot](https://chatchessassets.s3.ap-east-1.amazonaws.com/screenshots/Screenshot+2023-04-26+at+19.12.40.png)

Join us:

[![Chat Server](https://img.shields.io/badge/chat-discord-7289da.svg)](https://discord.gg/FSWXq4DmEj)

## Local Usage

### Be very careful that ChatGPT will make invalid moves and the server will retry calling OpenAI API until it gets a valid move (for now), and all those requests are billed.

1. Clone [ChatChess](https://github.com/prompt-engineering/chat-chess)。
2. Run `npm install`
3. Run `npm run dev` to serve front-end
4. In a new console, cd into `server` directory
5. Run `npm install`
6. Run `npm run start` to start the backend server

## LICENSE

This code is distributed under the MIT license. See [LICENSE](./LICENSE) in this directory.
