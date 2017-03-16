'use strict';

const Wechat = require('wechat4u');
const qrcode = require('qrcode-terminal');

module.exports = (interval, handlers, login, logout) => {
    const bot = new Wechat();

    bot.start();

    bot.on('uuid', (uuid) => {
        qrcode.generate(
            'https://login.weixin.qq.com/l/' + uuid,
            {
                small: true,
            }
        );
    });

    // TODO: duplicated code
    bot.on('login', () => {
        const timerEvents = [];

        const timer = () => {
            const now = Date.now();

            for (const event of timerEvents) {
                event(now);
            }

            setTimeout(timer, interval);
        };

        setTimeout(timer, interval);

        bot.onTimer = (event) => {
            timerEvents.push(event);
        };

        for (const handler of handlers) {
            handler(bot);
        }
    });

    bot.on('login', login);
    bot.on('logout', logout);
};
