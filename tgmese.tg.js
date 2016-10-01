'use strict';

const config = require('./config');
const core = require('./mese.core');
const access = require('./server.tgaccess');
const tgmeseReport = require('./tgmese.report');

const games = access.games;
const userGames = access.userGames;
const reports = access.reports;

module.exports = (bot) => {
    const sendAll = (now, game, i) => {
        core.printPublic(game.gameData, (report) => {
            reports[i] = {
                report: report,
                date: now + config.tgmeseReportTimeout,
            };

            if (game.total >= 1 || !game.users[i]) {
                bot.sendMessage(
                    i,
                    tgmeseReport(
                        reports[i].report,
                        'Main'
                    )
                );

                bot.sendMessage(
                    i,
                    tgmeseReport(
                        reports[i].report,
                        'Industry Average'
                    )
                );
            }
        });

        for (const j in game.users) {
            core.printPlayer(game.gameData, game.users[j].index, (report) => {
                reports[j] = {
                    report: report,
                    date: now + config.tgmeseReportTimeout,
                };

                bot.sendMessage(
                    j,
                    tgmeseReport(
                        reports[j].report,
                        'Main'
                    ),
                    {
                        reply_markup: {
                            inline_keyboard: [[{
                                text: 'Before Period',
                                callback_data: 'Before Period',
                            }], [{
                                text: 'After Period',
                                callback_data: 'After Period',
                            }], [{
                                text: 'Industry Average',
                                callback_data: 'Industry Average',
                            }]],
                        },
                    }
                );
            });
        }
    };

    access.engines.mese = (game) => {
        const now = Date.now();

        const allocator = (period) => {
            return (gameData) => {
                if (period < config.tgmeseSettings.length) {
                    core.alloc(
                        gameData,
                        config.tgmeseSettings[game.chat.id],
                        allocator(period + 1)
                    );
                } else {
                    game.closeDate = now + config.tgmeseCloseTimeout;
                    game.gameData = gameData;

                    game.period = 1;

                    sendAll(now, game, game.chat.id); // TODO
                }
            };
        };

        core.init(
            String(game.total),
            config.tgmesePreset,
            config.tgmeseSettings[0],
            allocator(1)
        );
    };

    bot.onText(/([\d.]+) (\d+) ([\d.]+) ([\d.]+) ([\d.]+)$/, (msg, match) => {
        if (userGames[msg.from.id]) {
            const game = userGames[msg.from.id];

            const oldData = game.gameData;

            core.submit(
                game.gameData,
                game.users[msg.from.id].index,
                -1,
                parseFloat(match[1]),
                parseFloat(match[2]),
                parseFloat(match[3]),
                parseFloat(match[4]),
                parseFloat(match[5]),
                (gameData) => {
                    if (game.gameData === oldData) {
                        game.gameData = gameData;

                        bot.sendMessage(
                            msg.chat.id,
                            'OK: Decision accepted\n'
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
                            'Fail: System error\n'
                            + '\n'
                            + 'Please submit again\n',
                            {
                                reply_to_message_id: msg.message_id,
                            }
                        );
                    }
                },
                (gameData) => {
                    if (game.gameData === oldData) {
                        game.gameData = gameData;
                    }

                    bot.sendMessage(
                        msg.chat.id,
                        'Fail: Decision declined\n',
                        {
                            reply_to_message_id: msg.message_id,
                        }
                    );
                }
            );
        } else {
            bot.sendMessage(
                msg.chat.id,
                'Fail: Game is not running now\n',
                {
                    reply_to_message_id: msg.message_id,
                }
            );
        }
    });

    bot.on('callback_query', (query) => {
        if (userGames[query.from.id]) {
            bot.sendMessage(
                query.from.id,
                tgmeseReport(
                    reports[query.from.id].report,
                    query.data
                )
            );
        }
    });

    bot.onTimer((now) => {
        for (const i in games) {
            const game = games[i];

            if (game.closeDate && game.closeDate < now) {
                delete game.closeDate;

                core.closeForce(game.gameData, (gameData) => {
                    game.closeDate = now + config.tgmeseCloseTimeout;
                    game.gameData = gameData;

                    game.period += 1;

                    if (game.period === config.tgmeseSettings.length) {
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
                });
            }
        }
    });
};
