MESE-Next Telegram and WeChat Server
===

This project is based on [MESE-Next](https://github.com/hczhcz/mese-next).

Requirements
---

To run the server, you need:

* Node.js 5.10+ and required packages
* MESE-Next Engine (released in MESE China Group)
* A bot token for Telegram or an account for WeChat

Installation
---

The server itself does not need installation.

Before running the server, you may do the following steps:

1. Clone this repository or [download it](https://github.com/hczhcz/mese-next-telegram/archive/master.zip);
2. Install Node.js;
3. Install NPM (Node.js Package Manager);
4. Install required NPM packages: `node-telegram-bot-api` for Telegram, or `wechat4u` and `qrcode-terminal` for WeChat;
5. Get MESE-Next Engine from our group or by contacting us;
6. Put MESE-Next Engine under the same directory as the server's, and give it execution permission;
7. Edit `config.js` if you want to change some configurations.

To run the server for Telegram:

8. Put your bot token in `token` under the same directory as the server's;
9. Run `main.tg.js` using Node.js.

To run the server for WeChat:

8. Login the WeChat account on your phone;
9. Run `main.wx.js` using Node.js;
10. Scan the QR Code shown on the terminal;
11. Authorize the Web WeChat session.

License
---

MESE-Next Telegram and WeChat Server - Copyright (C) 2015-2016 hczhcz

This project is **only** distributed in GitHub and MESE China Group, and released **without** any warranty. As this distribution is not under any public license, commercial use, public use, and redistribution outside GitHub are not allowed. Contact us if you need a licensed version.
