'use strict';

const config = require('./config');
const util = require('./util');
const cache = require('./server.cache');
const core = require('./mese.core');
const tgmeseMode = require('./tgmese.mode');
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

        if (!game.users[i]) {
            core.printPublic(
                Buffer.from(game.gameData),
                (report) => {
                    setPlayers(report);

                    reports[i] = {
                        report: report,
                        date: now + config.tgmeseReportTimeout,
                    };

                    bot.sendMessage(
                        i,
                        tgmeseReport(
                            reports[i].report,
                            'Main'
                        )
                    );
                }
            );
        }

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

                    if (j.match(/^ai_/)) {
                        util.log(
                            'report ' + j + '\n'
                            + JSON.stringify(reports[j].report.decisions)
                            + '\n'
                            + JSON.stringify(reports[j].report.data_early)
                            + '\n'
                            + JSON.stringify(reports[j].report.data)
                        );
                    } else {
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
                }
            );
        }
    };

    const init = (game, i) => {
        let names = '';

        for (const j in game.users) {
            names += ' ' + (game.users[j].username || game.users[j].id);
        }

        util.log('init' + names);

        const now = Date.now();

        tgmeseMode(game).onInit((preset, settings) => {
            // TODO: settings.length should >= 2

            const allocator = (period) => {
                const alloc = (gameData) => {
                    core.alloc(
                        gameData,
                        settings[period],
                        allocator(period + 1)
                    );
                };

                const done = (gameData) => {
                    tgmeseMode(game).onStart(gameData, (newData) => {
                        delete game.initDate;

                        game.totalPeriods = settings.length;
                        game.period = 1;

                        game.gameData = newData.toJSON().data;

                        game.closeDate = now + config.tgmeseCloseTimeout;
                        game.closeRemind = now + config.tgmeseCloseTimeout
                            - config.tgmeseCloseRemind;

                        sendAll(now, game, i);
                    });
                };

                return (gameData) => {
                    if (period < settings.length) {
                        alloc(gameData);
                    } else {
                        done(gameData);
                    }
                };
            };

            if (game.total > config.meseMaxPlayers) {
                throw Error('too many players');
            }

            core.init(
                String(game.total),
                preset,
                settings[0],
                allocator(1)
            );
        });
    };

    const close = (game, i) => {
        const now = Date.now();

        tgmeseMode(game).onClose(Buffer.from(game.gameData), (oldData) => {
            core.closeForce(
                oldData,
                (gameData) => {
                    if (game.period < game.totalPeriods - 1) {
                        tgmeseMode(game).onPeriod(gameData, (newData) => {
                            game.period += 1;

                            game.gameData = newData.toJSON().data;

                            game.closeDate = now + config.tgmeseCloseTimeout;
                            game.closeRemind = now + config.tgmeseCloseTimeout
                                - config.tgmeseCloseRemind;

                            sendAll(now, game, i);
                        });
                    } else {
                        tgmeseMode(game).onFinish(gameData, (newData) => {
                            game.period += 1;

                            game.gameData = newData.toJSON().data;

                            sendAll(now, game, i);

                            delete games[i];

                            for (const j in game.users) {
                                delete userGames[j];
                            }

                            bot.sendMessage(
                                i,
                                'Game finished #mese\n'
                                + '\n'
                                + 'Press /join to start a new game'
                            );
                        });
                    }
                }
            );
        });
    };

    bot.onText(/^\/lsmode(?!\w)/, (msg, match) => {
        util.log(
            (msg.chat.title || msg.chat.username || msg.chat.id)
            + ':' + (msg.from.username || msg.from.id)
            + ' lsmode'
        );

        bot.sendMessage(
            msg.chat.id,
            'Total periods:\n'
            + 'once shorter longer\n'
            + 'Presets:\n'
            + 'classic imese modern\n'
            + '\n'
            + 'Demand settings:\n'
            + 'socialism randdemand\n'
            + 'Share settings:\n'
            + '343 262 randshare\n'
            + 'Loan limits:\n'
            + 'survive harder easier\n'
            + '\n'
            + 'Misc:\n'
            + 'halflife traveler doubletax magicpi\n'
            + '\n'
            + 'AI players:\n'
            + 'daybreak bouquet setsuna magnet melody\n'
            + 'innocence kokoro saika moon spica\n',
            {
                reply_to_message_id: msg.message_id,
            }
        );
    });

    const decisionRe = /^\/?([\d.]+) +(\d+) +([\d.]+) +([\d.]+) +([\d.]+)$/;

    bot.onText(decisionRe, (msg, match) => {
        util.log(
            (msg.chat.title || msg.chat.username || msg.chat.id)
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
                    parseInt(match[2], 10),
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

    bot.onText(/^\/report(?!\w)/, (msg, match) => {
        util.log(
            (msg.chat.title || msg.chat.username || msg.chat.id)
            + ':' + (msg.from.username || msg.from.id)
            + ' report'
        );

        if (reports[msg.from.id]) {
            bot.sendMessage(
                msg.chat.id,
                tgmeseReport(
                    reports[msg.from.id].report,
                    'Before Period'
                )
            ).then(() => {
                bot.sendMessage(
                    msg.chat.id,
                    tgmeseReport(
                        reports[msg.from.id].report,
                        'After Period'
                    )
                ).then(() => {
                    bot.sendMessage(
                        msg.chat.id,
                        tgmeseReport(
                            reports[msg.from.id].report,
                            'Industry Average'
                        )
                    );
                });
            });
        } else {
            bot.sendMessage(
                msg.chat.id,
                'Failed: Your report is not available\n',
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

                init(game, i);
            }

            if (game.closeRemind && game.closeRemind < now) {
                delete game.closeRemind;

                if (!game.users[i]) {
                    bot.sendMessage(
                        i,
                        'Period will end in: '
                        + Math.round((game.closeDate - now) / 1000)
                        + ' seconds\n'
                    );
                }

                for (const j in game.users) {
                    if (!j.match(/^ai_/)) {
                        bot.sendMessage(
                            j,
                            'Period will end in: '
                            + Math.round((game.closeDate - now) / 1000)
                            + ' seconds\n'
                        );
                    }
                }
            }

            if (game.closeDate && game.closeDate < now) {
                delete game.closeDate;

                close(game, i);
            }
        }

        for (const i in reports) {
            if (reports[i].date < now) {
                delete reports[i];
            }
        }
    });
};
