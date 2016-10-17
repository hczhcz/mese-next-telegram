'use strict';

const config = require('./config');
const util = require('./util');
const cache = require('./server.cache');

const gathers = cache.gathers;
const games = cache.games;
const userGames = cache.userGames;

const readyTime = (ready, date, now) => {
    if (ready) {
        return 'Game will start in: '
            + Math.round((date - now) / 1000)
            + ' seconds\n';
    }

    return 'Please send a "ready" command to start the game\n'
        + '\n'
        + 'Game will expire in: '
        + Math.round((date - now) / 1000)
        + ' seconds\n';
};

const modeList = (modes) => {
    let result = 'Mode:\n';

    if (modes.length > 0) {
        for (const i in modes) {
            result += modes[i] + '\n';
        }
    } else {
        result += 'default\n';
    }

    return result;
};

const nameList = (users) => {
    let result = 'Players:\n';

    for (const j in users) {
        if (users[j].username) {
            result += '@' + users[j].username + '\n';
        } else {
            result += users[j].first_name + (
                users[j].last_name
                    ? ' ' + users[j].last_name
                    : ''
            ) + '\n';
        }
    }

    return result;
};

module.exports = (bot) => {
    bot.onText(/^\/mode(\w+)(?!\w)/, (msg, match) => {
        util.log(
            (msg.chat.username || msg.chat.id)
            + ':' + (msg.from.username || msg.from.id)
            + ' mode ' + match[1]
        );

        const now = Date.now();

        if (games[msg.chat.id]) {
            bot.sendMessage(
                msg.chat.id,
                'Failed: Game is running now\n',
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        } else if (gathers[msg.chat.id]) {
            const gather = gathers[msg.chat.id];

            if (match[1] === 'clear') {
                gather.modes = [];
            } else {
                if (gather.modes.length < config.tgMaxModes) {
                    let ok = true;

                    for (const i in gather.modes) {
                        if (match[1] === gather.modes[i]) {
                            ok = false;

                            break;
                        }
                    }

                    if (ok) {
                        gather.modes.push(match[1]);
                    }
                }
            }

            bot.sendMessage(
                msg.chat.id,
                'OK: Set mode\n'
                + '\n'
                + readyTime(gather.ready, gather.date, now)
                + '\n'
                + modeList(gather.modes)
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
                'Failed: Game does not exist\n'
                + '\n'
                + 'Press /join to start a new game\n',
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        }
    });

    bot.onText(/^\/join(?!\w)/, (msg, match) => {
        util.log(
            (msg.chat.username || msg.chat.id)
            + ':' + (msg.from.username || msg.from.id)
            + ' join'
        );

        const now = Date.now();

        if (games[msg.chat.id]) {
            bot.sendMessage(
                msg.chat.id,
                'Failed: Game is running now\n',
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        } else {
            bot.sendMessage(
                msg.from.id,
                config.tgMessage
            ).then((msgSent) => {
                if (userGames[msg.from.id]) {
                    bot.sendMessage(
                        msg.chat.id,
                        'Failed: You are in a game now\n',
                        {
                            reply_to_message_id: msg.message_id,
                        }
                    );
                } else if (gathers[msg.chat.id]) {
                    const gather = gathers[msg.chat.id];

                    gather.users[msg.from.id] = msg.from;
                    gather.total += 1;
                    userGames[msg.from.id] = msg.chat.id;

                    bot.sendMessage(
                        msg.chat.id,
                        'OK: Join game\n'
                        + '\n'
                        + readyTime(gather.ready, gather.date, now)
                        + '\n'
                        + modeList(gather.modes)
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
                        modes: [],
                        users: {},
                        total: 0,
                        cancel: 0,
                        date: now + config.tgGatherTimeout,
                        remind: now + config.tgGatherTimeout
                            - config.tgGatherRemind,
                    };

                    gather.users[msg.from.id] = msg.from;
                    gather.total += 1;
                    userGames[msg.from.id] = msg.chat.id;

                    bot.sendMessage(
                        msg.chat.id,
                        'OK: New game\n'
                        + '\n'
                        + readyTime(gather.ready, gather.date, now)
                        + '\n'
                        + modeList(gather.modes)
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
                    'Failed: Please start @'
                    + bot.me.username
                    + ' and join again\n',
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

    bot.onText(/^\/flee(?!\w)/, (msg, match) => {
        util.log(
            (msg.chat.username || msg.chat.id)
            + ':' + (msg.from.username || msg.from.id)
            + ' flee'
        );

        const now = Date.now();

        if (games[msg.chat.id]) {
            const game = games[msg.chat.id];

            if (game.users[msg.from.id]) {
                if (!game.users[msg.from.id].cancel) {
                    game.users[msg.from.id].cancel = true;
                    game.cancel += 1;
                }

                if (game.cancel < game.total) {
                    bot.sendMessage(
                        msg.chat.id,
                        'OK: Called game cancellation\n'
                        + '\n'
                        + '/flee\n',
                        {
                            reply_to_message_id: msg.message_id,
                        }
                    );
                } else {
                    delete games[msg.chat.id];

                    for (const j in game.users) {
                        delete userGames[j];
                    }

                    bot.sendMessage(
                        msg.chat.id,
                        'OK: Called game cancellation\n'
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
                    'Failed: You are not in this game\n',
                    {
                        reply_to_message_id: msg.message_id,
                    }
                );
            }
        } else if (gathers[msg.chat.id]) {
            const gather = gathers[msg.chat.id];

            if (gather.users[msg.from.id]) {
                delete gather.users[msg.from.id];
                gather.total -= 1;
                delete userGames[msg.from.id];

                if (gather.total > 0) {
                    bot.sendMessage(
                        msg.chat.id,
                        'OK: Leave game\n'
                        + '\n'
                        + readyTime(gather.ready, gather.date, now)
                        + '\n'
                        + modeList(gather.modes)
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
                    'Failed: You are not in this game\n',
                    {
                        reply_to_message_id: msg.message_id,
                    }
                );
            }
        } else {
            bot.sendMessage(
                msg.chat.id,
                'Failed: Game does not exist\n'
                + '\n'
                + 'Press /join to start a new game\n',
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        }
    });

    bot.onText(/^\/ready(?!\w)/, (msg, match) => {
        util.log(
            (msg.chat.username || msg.chat.id)
            + ':' + (msg.from.username || msg.from.id)
            + ' ready'
        );

        const now = Date.now();

        if (games[msg.chat.id]) {
            bot.sendMessage(
                msg.chat.id,
                'Failed: Game is running now\n',
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        } else if (gathers[msg.chat.id]) {
            const gather = gathers[msg.chat.id];

            if (!gather.ready) {
                gather.ready = true;
                gather.date = now + config.tgReadyTimeout;
                delete gather.remind;
            }

            bot.sendMessage(
                msg.chat.id,
                'OK: Ready to start\n'
                + '\n'
                + readyTime(gather.ready, gather.date, now)
                + '\n'
                + modeList(gather.modes)
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
                'Failed: Game does not exist\n'
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

            if (gather.remind && gather.remind < now) {
                delete gather.remind;

                bot.sendMessage(
                    i,
                    readyTime(gather.ready, gather.date, now)
                    + '\n'
                    + modeList(gather.modes)
                    + '\n'
                    + nameList(gather.users)
                    + '\n'
                    + '/join /flee\n'
                );
            }

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
                        throw Error('broken data'); // never reach
                    }

                    game.needInit = true;
                    game.initDate = now + config.tgInitTimeout;

                    bot.sendMessage(
                        i,
                        'Game started\n'
                        + '\n'
                        + modeList(game.modes)
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
                        + 'Please /join the game again\n'
                    );
                }
            }
        }

        for (const i in games) {
            const game = games[i];

            if (game.initDate && game.initDate < now) {
                delete games[i];

                for (const j in game.users) {
                    delete userGames[j];
                }

                bot.sendMessage(
                    i,
                    'Game initialization failed\n'
                    + '\n'
                    + 'Press /join to start a new game'
                );
            }
        }
    });
};
