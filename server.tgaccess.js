'use strict';

const fs = require('fs');

module.exports.init = (interval, file, callback) => {
    fs.readFile(file, (err, data) => {
        if (err) {
            module.exports.gathers = {};
            module.exports.games = {};
            module.exports.userGames = {};
            module.exports.reports = {};
        } else {
            const parsed = JSON.parse(data);

            module.exports.gathers = parsed.gathers;
            module.exports.games = parsed.games;
            module.exports.userGames = parsed.userGames;
            module.exports.reports = parsed.reports;
        }

        callback();

        setInterval(() => {
            const data = JSON.stringify({
                gathers: module.exports.gathers,
                games: module.exports.games,
                userGames: module.exports.userGames,
                reports: module.exports.reports,
            });

            fs.writeFile(file, data, () => {
                // nothing
            });
        }, interval);
    });
};
