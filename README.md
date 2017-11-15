MESE-Next Telegram and WeChat Server
===

This project is based on [MESE-Next](https://github.com/hczhcz/mese-next).

Requirements
---

To run the server, you need:

* Node.js 5.10+ and required packages
* MESE-Next Engine binary
* A Telegram bot token or a WeChat account for bot

Installation
---

The server itself does not need installation.

Before running the server, you may do the following steps:

1. Clone this repository or [download it](https://github.com/hczhcz/mese-next-telegram/archive/master.zip);
2. Install Node.js;
3. Install NPM (Node.js Package Manager);
4. Install required NPM packages: `node-telegram-bot-api` for Telegram, or `wechat4u` and `qrcode-terminal` for WeChat;
5. Make sure MESE-Next Engine is under the same directory as the server's, and give it execution permission (`chmod +x`);
6. Edit `config.js` if you want to change some configurations.

To run the server for Telegram:

7. Put your bot token in `token` under the same directory as the server's;
8. Run `main.tg.js` using Node.js.

To run the server for WeChat:

7. Login the WeChat account on your phone;
8. Run `main.wx.js` using Node.js;
9. Scan the QR Code shown on the terminal;
10. Authorize the Web WeChat session.

License
---

MESE-Next Telegram and WeChat Server - Copyright (C) 2015-2017 hczhcz

This project is **only** distributed in GitHub and MESE China Group, and released **without** any warranty. This distribution is not under any public license. Commercial use and redistribution outside GitHub are not allowed without the author's permission. Please contact @hczhcz if you need a licensed version.

MESE-Next Engine

MESE-Next Engine in this repository is released **without** any warranty or copyright guarantee. Please use at your own risk.
