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

            const puList = [];

            for (const item of tgmeseReport.list(reports[i].report)) {
                puList.push([{
                    text: item,
                    callback_data: item,
                }]);
            }

            bot.sendMessage(
                i,
                tgmeseReport.content(reports[i].report, 'main'),
                {
                    reply_markup: {
                        inline_keyboard: puList,
                    },
                }
            ).then((msgSent) => {
                reports[i].msg = msgSent;
            });
        });

        for (const j in game.users) {
            core.printPlayer(game.gameData, game.users[j].index, (report) => {
                reports[i] = {
                    report: report,
                    date: now + config.tgmeseReportTimeout,
                };

                const prList = [];

                for (const item of tgmeseReport.list(reports[i].report)) {
                    prList.push([{
                        text: item,
                        callback_data: item,
                    }]);
                }

                bot.sendMessage(
                    j,
                    tgmeseReport.content(reports[j].report, 'main'),
                    {
                        reply_markup: {
                            inline_keyboard: prList,
                        },
                    }
                ).then((msgSent) => {
                    reports[i].msg = msgSent;
                }, () => {
                    //
                });
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
                            + 'Pr ' + match[1] + ' '
                            + 'Pd ' + match[2] + ' '
                            + 'Mk ' + match[3] + ' '
                            + 'CI ' + match[4] + ' '
                            + 'RD ' + match[5] + '\n',
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

    bot.on('callback_query', (msg) => {
        if (userGames[msg.from.id]) {
            bot.editMessageText(
                tgmeseReport.content(reports[msg.from.id].report),
                {
                    message_id: reports[msg.from.id].msg.id,
                }
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
