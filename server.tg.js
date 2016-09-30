'use strict';

const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

module.exports = (interval, timerHandler, handlers) => {
    const token = String(fs.readFileSync('token'));
    const bot = new TelegramBot(token, {
        polling: {
            interval: interval,
        },
    });

    const timer = () => {
        const now = Date.now();

        timerHandler(bot, now);

        setTimeout(timer, interval);
    };

    setTimeout(timer, interval); // TODO: sync with poll?

    for (const handler of handlers) {
        handler(bot);
    }
};
