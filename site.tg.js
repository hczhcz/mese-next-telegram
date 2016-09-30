'use strict';

const config = require('./config');
const access = require('./server.tgaccess');

module.exports = (bot) => {
    bot.onText(/\/join/, (msg, match) => {
        const now = Date.now();

        if (games[msg.chat.id]) {
            bot.sendMessage(
                msg.chat.id,
                'Fail: Game is running now\n',
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        } else if (userGames[msg.from.id]) {
            bot.sendMessage(
                msg.chat.id,
                'Fail: You are in a game now\n',
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        } else {
            bot.sendMessage(
                msg.from.id,
                'Hello from MESE bot\n'
            ).then(() => {
                if (gathers[msg.chat.id]) {
                    const gather = gathers[msg.chat.id];

                    gather.users[msg.from.id] = msg.from;
                    gather.total += 1;
                    userGames[msg.from.id] = msg.from;

                    bot.sendMessage(
                        msg.chat.id,
                        'OK: Join game\n'
                        + '\n'
                        + readyTime(gather.ready, gather.date, now)
                        + '\n'
                        + nameList(gather.users)
                        + '\n'
                        + '/join /flee\n',
                        {
                            reply_to_message_id: msg.message_id,
                        }
                    );
                } else {
                    const gather = gathers[msg.chat.id] = {
                        chat: msg.chat,
                        users: {},
                        total: 0,
                        date: now + config.tgGatherTimeout,
                    };

                    gather.users[msg.from.id] = msg.from;
                    gather.total += 1;
                    userGames[msg.from.id] = msg.from;

                    bot.sendMessage(
                        msg.chat.id,
                        'OK: New game\n'
                        + '\n'
                        + readyTime(gather.ready, gather.date, now)
                        + '\n'
                        + nameList(gather.users)
                        + '\n'
                        + '/join /flee\n',
                        {
                            reply_to_message_id: msg.message_id,
                        }
                    );
                }
            }, () => {
                bot.sendMessage(
                    msg.chat.id,
                    'Fail: Please start @' + config.tgBot + '\n',
                    {
                        reply_to_message_id: msg.message_id,
                        reply_markup: {
                            inline_keyboard: [[{
                                text: 'Start',
                                url: 'https://telegram.me/' + config.tgBot,
                            }]],
                        },
                    }
                );
            });
        }
    };

    bot.onText(/\/flee/, (msg, match) => {
        const now = Date.now();

        if (games[msg.chat.id]) {
            bot.sendMessage(
                msg.chat.id,
                'Fail: Game is running now\n',
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        } else if (gathers[msg.chat.id]) {
            const gather = gathers[msg.chat.id];

            if (gather.users[msg.from.id]) {
                delete gather.users[msg.from.id];
                gather.total -= 1;
                delete userGames[msg.from.id];
            }

            if (gather.total > 0) {
                bot.sendMessage(
                    msg.chat.id,
                    'OK: Leave game\n'
                    + '\n'
                    + readyTime(gather.ready, gather.date, now)
                    + '\n'
                    + nameList(gather.users)
                    + '\n'
                    + '/join /flee\n',
                    {
                        reply_to_message_id: msg.message_id,
                    }
                );
            } else {
                delete gathers[msg.chat.id];

                bot.sendMessage(
                    msg.chat.id,
                    'OK: Leave game\n'
                    + '\n'
                    + 'Game is canceled\n',
                    {
                        reply_to_message_id: msg.message_id,
                    }
                );
            }
        } else {
            bot.sendMessage(
                msg.chat.id,
                'Fail: Game does not exist\n'
                + '\n'
                + 'Press /join to start a new game\n',
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        }
    };

    bot.onText(/\/ready/, (msg, match) => {
        const now = Date.now();

        if (games[msg.chat.id]) {
            bot.sendMessage(
                msg.chat.id,
                'Fail: Game is running now\n',
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        } else if (gathers[msg.chat.id]) {
            const gather = gathers[msg.chat.id];

            if (!gather.ready) {
                gather.ready = true;
                gather.date = now + config.tgReadyTimeout;
            }

            bot.sendMessage(
                msg.chat.id,
                'OK: Ready to start\n'
                + '\n'
                + readyTime(gather.ready, gather.date, now)
                + '\n'
                + nameList(gather.users)
                + '\n'
                + '/join /flee\n',
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        } else {
            bot.sendMessage(
                msg.chat.id,
                'Fail: Game does not exist\n'
                + '\n'
                + 'Press /join to start a new game\n',
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        }
    };
};
