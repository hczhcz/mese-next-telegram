'use strict';

const config = require('./config');
const core = require('./mese.core');

module.exports = (game) => {
    let preset = 'modern';
    const settings = [{}, {}, {}, {}, {}, {}, {}, {}];

    const onInitEvents = [];
    const onStartEvents = [];
    const onPeriodEvents = [];
    const onCloseEvents = [];
    const onFinishEvents = [];

    for (const mode in game.modes) {
        switch (game.modes[mode]) {
            // length
            case 'once': {
                settings.length = 2;

                break;
            }
            case 'shorter': {
                if (settings.length > 2) {
                    settings.pop();
                }

                break;
            }
            case 'longer': {
                if (settings.length < 32) {
                    settings.push({});
                }

                break;
            }

            // preset
            case 'classic':
            case 'imese':
            case 'modern': {
                preset = game.modes[mode];

                break;
            }

            // demand
            case 'socialism': {
                let demand = 70;

                for (let i = 1; i < settings.length; i += 1) {
                    demand *= 0.5;
                    settings[i].demand = demand;
                }

                break;
            }
            case 'randdemand': {
                const begin = 0.8 + 0.4 * Math.random();
                const end = 0.8 + 0.4 * Math.random();
                let demand = 70;

                for (let i = 1; i < settings.length; i += 1) {
                    const f1 = settings.length - 1 - i;
                    const f2 = i - 1;
                    const rev = 1 / (f1 + f2);

                    demand *= rev * (f1 * begin + f2 * end);
                    settings[i].demand = demand;
                }

                break;
            }

            // share
            case '343': {
                for (let i = 1; i < settings.length; i += 1) {
                    settings[i].share_price = 0.4;
                    settings[i].share_mk = 0.3;
                    settings[i].share_rd = 0.3;
                }

                break;
            }
            case '262': {
                for (let i = 1; i < settings.length; i += 1) {
                    settings[i].share_price = 0.6;
                    settings[i].share_mk = 0.2;
                    settings[i].share_rd = 0.2;
                }

                break;
            }
            case 'randshare': {
                const mk_begin = 0.15 + 0.2 * Math.random();
                const rd_begin = 0.15 + 0.2 * Math.random();
                const mk_end = 0.15 + 0.2 * Math.random();
                const rd_end = 0.15 + 0.2 * Math.random();

                for (let i = 1; i < settings.length; i += 1) {
                    const f1 = settings.length - 1 - i;
                    const f2 = i - 1;
                    const rev = 1 / (f1 + f2);

                    settings[i].share_price = rev * (
                        f1 * (1 - mk_begin - rd_begin)
                        + f2 * (1 - mk_end - rd_end)
                    );
                    settings[i].share_mk = rev * (f1 * mk_begin + f2 * mk_end);
                    settings[i].share_rd = rev * (f1 * rd_begin + f2 * rd_end);
                }

                break;
            }

            // loan
            case 'survive': {
                settings[1].loan_limit = 0;

                break;
            }
            case 'harder': {
                if (typeof settings[1].loan_limit !== 'number') {
                    settings[1].loan_limit = 30000;
                }

                settings[1].loan_limit -= 10000;

                if (settings[1].loan_limit < 0) {
                    settings[1].loan_limit = 0;
                }

                break;
            }
            case 'easier': {
                if (typeof settings[1].loan_limit !== 'number') {
                    settings[1].loan_limit = 30000;
                }

                settings[1].loan_limit += 10000;

                break;
            }

            // misc
            case 'halflife': {
                settings[0].initial_capital = 2100;
                settings[0].unit_fee = 4;
                settings[0].depreciation_rate = 0.5;

                break;
            }
            case 'traveler': {
                settings[1].inventory_fee = 10;

                break;
            }
            case 'doubletax': {
                settings[1].tax_rate = 0.5;

                break;
            }
            case 'magicpi': {
                settings[1].mpi_factor_a = 50;
                settings[1].mpi_factor_b = 50;
                settings[1].mpi_factor_c = 50;
                settings[1].mpi_factor_d = 50;
                settings[1].mpi_factor_e = 50;
                settings[1].mpi_factor_f = 50;

                break;
            }

            // AI
            case 'daybreak':
            case 'bouquet':
            case 'setsuna':
            case 'magnet':
            case 'melody': {
                onInitEvents.push((callback) => {
                    game.users['ai_' + mode] = {
                        id: 'ai_' + mode,
                        first_name: game.modes[mode],
                        index: game.total,
                    };
                    game.total += 1;

                    callback();
                });

                onStartEvents.push((gameData, callback) => {
                    game.total -= 1;

                    callback(gameData);
                });

                if (config.tgmeseTwoPassAI) {
                    onStartEvents.push((gameData, callback) => {
                        const aiMap = {
                            daybreak: 'innocence',
                            bouquet: 'kokoro',
                            setsuna: 'saika',
                            magnet: 'moon',
                            melody: 'kokoro',
                        };

                        core.ai(
                            gameData,
                            game.users['ai_' + mode].index,
                            aiMap[game.modes[mode]],
                            callback
                        );
                    });
                    onPeriodEvents.push(
                        onStartEvents[onStartEvents.length - 1]
                    );
                }

                onCloseEvents.push((gameData, callback) => {
                    core.ai(
                        gameData,
                        game.users['ai_' + mode].index,
                        game.modes[mode],
                        callback
                    );
                });

                break;
            }
            case 'innocence':
            case 'kokoro':
            case 'saika':
            case 'moon':
            case 'spica': {
                onInitEvents.push((callback) => {
                    game.users['ai_' + mode] = {
                        id: 'ai_' + mode,
                        first_name: game.modes[mode],
                        index: game.total,
                    };
                    game.total += 1;

                    callback();
                });

                onStartEvents.push((gameData, callback) => {
                    game.total -= 1;

                    callback(gameData);
                });

                onStartEvents.push((gameData, callback) => {
                    core.ai(
                        gameData,
                        game.users['ai_' + mode].index,
                        game.modes[mode],
                        callback
                    );
                });
                onPeriodEvents.push(
                    onStartEvents[onStartEvents.length - 1]
                );

                break;
            }

            default: {
                // TODO

                break;
            }
        }
    }

    return {
        onInit: (callback) => {
            let i = -1;

            const exec = () => {
                i += 1;

                if (i < onInitEvents.length) {
                    onInitEvents[i](exec);
                } else {
                    callback(preset, settings);
                }
            };

            exec();
        },

        onStart: (gameData, callback) => {
            let i = -1;

            const exec = (newData) => {
                i += 1;

                if (i < onStartEvents.length) {
                    onStartEvents[i](newData, exec);
                } else {
                    callback(newData);
                }
            };

            exec(gameData);
        },

        onPeriod: (gameData, callback) => {
            let i = -1;

            const exec = (newData) => {
                i += 1;

                if (i < onPeriodEvents.length) {
                    onPeriodEvents[i](newData, exec);
                } else {
                    callback(newData);
                }
            };

            exec(gameData);
        },

        onClose: (gameData, callback) => {
            let i = -1;

            const exec = (newData) => {
                i += 1;

                if (i < onCloseEvents.length) {
                    onCloseEvents[i](newData, exec);
                } else {
                    callback(newData);
                }
            };

            exec(gameData);
        },

        onFinish: (gameData, callback) => {
            let i = -1;

            const exec = (newData) => {
                i += 1;

                if (i < onFinishEvents.length) {
                    onFinishEvents[i](newData, exec);
                } else {
                    callback(newData);
                }
            };

            exec(gameData);
        },
    };
};
