'use strict';

const config = require('./config');
const core = require('./mese.core');
const access = require('./server.tgaccess');

const games = access.games;
const userGames = access.userGames;
const reports = access.reports;

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

module.exports = (bot) => {
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
