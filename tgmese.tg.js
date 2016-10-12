'use strict';

const config = require('./config');
const util = require('./util');
const cache = require('./server.cache');
const core = require('./mese.core');
const tgmeseReport = require('./tgmese.report');

const games = cache.games;
const userGames = cache.userGames;
const reports = cache.reports;

module.exports = (bot) => {
    const sendAll = (now, game, i) => {
        const setPlayers = (report) => {
            report.players = [];

            for (const j in game.users) {
                const user = game.users[j];

                if (user.username) {
                    report.players[user.index] = '@' + user.username;
                } else {
                    report.players[user.index] = user.first_name + (
                        user.last_name
                            ? ' ' + user.last_name
                            : ''
                    );
                }
            }
        };

        core.printPublic(
            Buffer.from(game.gameData),
            (report) => {
                setPlayers(report);

                reports[i] = {
                    report: report,
                    date: now + config.tgmeseReportTimeout,
                };

                if (game.total > 1 || !game.users[i]) {
                    bot.sendMessage(
                        i,
                        tgmeseReport(
                            reports[i].report,
                            'Main'
                        )
                    );
                }
            }
        );

        for (const j in game.users) {
            core.printPlayer(
                Buffer.from(game.gameData),
                game.users[j].index,
                (report) => {
                    setPlayers(report);

                    reports[j] = {
                        report: report,
                        date: now + config.tgmeseReportTimeout,
                    };

                    bot.sendMessage(
                        j,
                        tgmeseReport(
                            reports[j].report,
                            'Main'
                        )
                    ).then(() => {
                        const buttons = [[{
                            text: 'Before Period',
                            callback_data: JSON.stringify(
                                ['Before Period', reports[j].date]
                            ),
                        }], [{
                            text: 'After Period',
                            callback_data: JSON.stringify(
                                ['After Period', reports[j].date]
                            ),
                        }], [{
                            text: 'Industry Average',
                            callback_data: JSON.stringify(
                                ['Industry Average', reports[j].date]
                            ),
                        }]];

                        bot.sendMessage(
                            j,
                            tgmeseReport(
                                reports[j].report,
                                'Brief'
                            ),
                            {
                                reply_markup: {
                                    inline_keyboard: buttons,
                                },
                            }
                        ).then(() => {
                            if (reports[j].report.next_settings) {
                                bot.sendMessage(
                                    j,
                                    tgmeseReport(
                                        reports[j].report,
                                        'Decision'
                                    )
                                );
                            } else {
                                bot.sendMessage(
                                    j,
                                    'Game finished\n'
                                );
                            }
                        });
                    });
                }
            );
        }
    };

    const init = (game) => {
        let names = '';

        for (const j in game.users) {
            names += ' ' + (game.users[j].username || game.users[j].id);
        }

        util.log('init' + names);

        const now = Date.now();

        const preset = config.tgmesePreset;
        const settings = config.tgmeseSettings;

        const allocator = (period) => {
            return (gameData) => {
                if (period < settings.length) {
                    core.alloc(
                        gameData,
                        settings[period],
                        allocator(period + 1)
                    );
                } else {
                    delete game.initDate;

                    game.totalPeriods = settings.length;
                    game.closeDate = now + config.tgmeseCloseTimeout;
                    game.closeRemind = now + config.tgmeseCloseTimeout
                        - config.tgmeseCloseRemind;
                    game.gameData = gameData.toJSON().data;

                    game.period = 1;

                    sendAll(now, game, game.chat.id);
                }
            };
        };

        core.init(
            String(game.total),
            preset,
            settings[0],
            allocator(1)
        );
    };

    const decisionRe = /([\d.]+) +(\d+) +([\d.]+) +([\d.]+) +([\d.]+)$/;

    bot.onText(decisionRe, (msg, match) => {
        util.log(
            (msg.chat.username || msg.chat.id)
            + ':' + (msg.from.username || msg.from.id)
            + ' submit'
        );

        if (userGames[msg.from.id]) {
            const game = games[userGames[msg.from.id]];

            if (game && game.closeDate) {
                const oldData = Buffer.from(game.gameData);

                core.submit(
                    oldData,
                    game.users[msg.from.id].index,
                    -1,
                    parseFloat(match[1]),
                    parseFloat(match[2]),
                    parseFloat(match[3]),
                    parseFloat(match[4]),
                    parseFloat(match[5]),
                    (gameData) => {
                        if (Buffer.from(game.gameData).equals(oldData)) {
                            game.gameData = gameData.toJSON().data;

                            bot.sendMessage(
                                msg.chat.id,
                                'OK: Decision is accepted\n'
                                + '\n'
                                + 'Price - ' + match[1] + '\n'
                                + 'Prod - ' + match[2] + '\n'
                                + 'Marketing - ' + match[3] + '\n'
                                + 'Investment - ' + match[4] + '\n'
                                + 'R & D - ' + match[5] + '\n',
                                {
                                    reply_to_message_id: msg.message_id,
                                }
                            );
                        } else {
                            // TODO
                            bot.sendMessage(
                                msg.chat.id,
                                'Failed: System error\n'
                                + '\n'
                                + 'Please submit again\n',
                                {
                                    reply_to_message_id: msg.message_id,
                                }
                            );
                        }
                    },
                    (gameData) => {
                        bot.sendMessage(
                            msg.chat.id,
                            'Failed: Decision is declined\n',
                            {
                                reply_to_message_id: msg.message_id,
                            }
                        );
                    }
                );
            } else {
                bot.sendMessage(
                    msg.chat.id,
                    'Failed: Game is not running\n',
                    {
                        reply_to_message_id: msg.message_id,
                    }
                );
            }
        } else {
            bot.sendMessage(
                msg.chat.id,
                'Failed: You are not in a game\n',
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        }
    });

    bot.on('callback_query', (query) => {
        const data = JSON.parse(query.data);

        if (
            reports[query.from.id]
            && reports[query.from.id].date === data[1]
        ) {
            bot.answerCallbackQuery(query.id);

            bot.sendMessage(
                query.from.id,
                tgmeseReport(
                    reports[query.from.id].report,
                    data[0]
                )
            );
        }
    });

    bot.onTimer((now) => {
        for (const i in games) {
            const game = games[i];

            if (game.needInit) {
                delete game.needInit;

                init(game);
            }

            if (game.closeRemind && game.closeRemind < now) {
                delete game.closeRemind;

                bot.sendMessage(
                    i,
                    'Period will end in: '
                    + Math.round((game.closeDate - now) / 1000)
                    + ' seconds\n'
                );

                for (const j in game.users) {
                    bot.sendMessage(
                        j,
                        'Period will end in: '
                        + Math.round((game.closeDate - now) / 1000)
                        + ' seconds\n'
                    );
                }
            }

            if (game.closeDate && game.closeDate < now) {
                delete game.closeDate;

                core.closeForce(
                    Buffer.from(game.gameData),
                    (gameData) => {
                        game.closeDate = now + config.tgmeseCloseTimeout;
                        game.closeRemind = now + config.tgmeseCloseTimeout
                            - config.tgmeseCloseRemind;
                        game.gameData = gameData.toJSON().data;

                        game.period += 1;

                        if (game.period === game.totalPeriods) {
                            delete games[i];

                            for (const j in game.users) {
                                delete userGames[j];
                            }

                            bot.sendMessage(
                                i,
                                'Game finished\n'
                                + '\n'
                                + 'Press /join to start a new game'
                            );
                        }

                        sendAll(now, game, i);
                    }
                );
            }
        }

        for (const i in reports) {
            if (reports[i].date < now) {
                delete reports[i];
            }
        }
    });
};
