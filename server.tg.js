'use strict';

const TelegramBot = require('node-telegram-bot-api');

module.exports = (token, interval, handlers) => {
    const bot = new TelegramBot(token, {
        polling: {
            interval: interval,
        },
    });

    bot.getMe().then((info) => {
        bot.me = info;

        const timerEvents = [];

        const timer = () => {
            const now = Date.now();

            for (const event of timerEvents) {
                event(now);
            }

            setTimeout(timer, interval);
        };

        setTimeout(timer, interval); // TODO: sync with poll?

        bot.onTimer = (event) => {
            timerEvents.push(event);
        };

        bot.on('polling_error', (err) => {
            if (!(err instanceof TelegramBot.errors.ParseError)) {
                throw err;
            }
        });

        for (const handler of handlers) {
            handler(bot);
        }
    });
};
