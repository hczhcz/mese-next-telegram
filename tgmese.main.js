'use strict';

const config = require('./config');
const core = require('./mese.core');
const tg = require('./server.tg');
// const report = require('./tgmese.report');

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

const sendAll = (bot, game, i) => {
    core.printPublic(game.gameData, (report) => {
        reports[i] = report;

        bot.sendMessage(
            i,
            reports[i] // TODO
        );
    });

    for (const j in game.users) {
        core.printPlayer(game.gameData, game.users[j].index, (report) => {
            reports[j] = report;

            bot.sendMessage(
                j,
                reports[j] // TODO
            ).then(() => {
                //
            }, () => {
                //
            });
        });
    }
};

tg(config.tgInterval, (bot, now) => {
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

                bot.sendMessage(
                    i,
                    'Game started\n'
                    + '\n'
                    + nameList(game.users)
                );

                const allocator = (period) => {
                    return (gameData) => {
                        if (period < config.tgmeseSettings.length) {
                            core.alloc(
                                gameData,
                                config.tgmeseSettings[i],
                                allocator(period + 1)
                            );
                        } else {
                            game.closeDate = now + config.tgmeseCloseTimeout;
                            game.gameData = gameData;

                            game.period = 1;

                            sendAll(bot, game, i);
                        }
                    };
                };

                core.init(
                    String(game.total),
                    config.tgmesePreset,
                    config.tgmeseSettings[0],
                    allocator(1)
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
}, [
    require('./site.tg'),
    require('./tgmese.tg'),
]);
