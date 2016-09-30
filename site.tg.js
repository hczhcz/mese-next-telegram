'use strict';

const config = require('./config');
const access = require('./server.tgaccess');

const gathers = access.gathers;
const games = access.games;
const userGames = access.userGames;

const readyTime = (ready, date, now) => {
    if (ready) {
        return 'Game will start in: '
            + Math.round((date - now) / 1000) + ' seconds\n';
    } else {
        return 'Press /ready to start the game\n'
            + 'Or game will expire in: '
            + Math.round((date - now) / 1000) + ' seconds\n';
    }
};

const nameList = (users) => {
    let result = 'Players:\n';

    for (const j in users) {
        if (users[j].username) {
            result += '@' + users[j].username + '\n';
        } else {
            result += users[j].first_name + ' ' + users[j].last_name + '\n';
        }
    }

    return result;
};

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
                    'Fail: Please start @' + bot.me.username + '\n',
                    {
                        reply_to_message_id: msg.message_id,
                        reply_markup: {
                            inline_keyboard: [[{
                                text: 'Start',
                                url: 'https://telegram.me/' + bot.me.username,
                            }]],
                        },
                    }
                );
            });
        }
    });

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
    });

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
    });

    bot.onTimer((now) => {
        for (const i in gathers) {
            const gather = gathers[i];

            if (gather.date < now) {
                delete gathers[i];

                if (gather.ready) {
                    const game = games[i] = gather;

                    let total = 0;

                    for (const j in game.users) {
                        game.users[j].index = total;
                        total += 1;
                    }

                    if (total !== game.total) {
                        throw 1; // never reach
                    }

                    access.engines.mese(game);

                    bot.sendMessage(
                        i,
                        'Game started\n'
                        + '\n'
                        + nameList(game.users)
                    );
                } else {
                    for (const j in gather.users) {
                        delete userGames[j];
                    }

                    bot.sendMessage(
                        i,
                        'Game expired\n'
                        + '\n'
                        + 'Please /join the game again'
                    );
                }
            }
        }
    });
};
