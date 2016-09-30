'use strict';

const config = require('./config');
const core = require('./mese.core');
const access = require('./server.tgaccess');
const tgmeseReport = require('./tgmese.report');

const games = access.games;
const userGames = access.userGames;
const reports = access.reports;

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

                // sendAll(bot, game, i); // TODO
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

const sendAll = (bot, game, i) => {
    core.printPublic(game.gameData, (report) => {
        reports[i] = report;

        bot.sendMessage(
            i,
            JSON.stringify(reports[i]) // TODO
        );
    });

    for (const j in game.users) {
        core.printPlayer(game.gameData, game.users[j].index, (report) => {
            reports[j] = report;

            bot.sendMessage(
                j,
                JSON.stringify(reports[j]) // TODO
            ).then(() => {
                //
            }, () => {
                //
            });
        });
    }
};

module.exports = (bot) => {
    bot.onText(/([\d.]+) (\d+) ([\d.]+) ([\d.]+) ([\d.]+)$/, (msg, match) => {
        const now = Date.now();

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

                    sendAll(bot, game, i);
                });
            }
        }
    });
};
