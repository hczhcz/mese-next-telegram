'use strict';

const core = require('./mese.core');

module.exports = (game) => {
    let preset = 'modern';
    const settings = [{}, {}, {}, {}, {}, {}, {}, {}];

    const onInitEvents = [];
    const onStartEvents = [];
    const onPeriodEvents = [];
    const onCloseEvents = [];
    const onFinishEvents = [];

    for (const i in game.modes) {
        switch (game.modes[i]) {
            // length
            case 'once': {
                settings.length = 2;

                break;
            }
            case 'short': {
                if (settings.length > 2) {
                    settings.pop();
                }

                break;
            }
            case 'long': {
                settings.push({});

                break;
            }

            // preset
            case 'classic':
            case 'imese':
            case 'modern': {
                preset = game.modes[i];

                break;
            }

            // demand
            case 'randdemand': {
                const begin = 0.75 + 0.5 * Math.random();
                const end = 0.75 + 0.5 * Math.random();

                for (let i = 1; i < settings.length; ++i) {
                    const f1 = settings.length - 1 - i;
                    const f2 = i - 1;
                    const k = 1 / (f1 + f2);

                    settings[i].demand = 70 * k * (f1 * begin + f2 * end);
                }

                break;
            }

            // share
            case '343': {
                for (let i = 1; i < settings.length; ++i) {
                    settings[i].share_price = 0.4;
                    settings[i].share_mk = 0.3;
                    settings[i].share_rd = 0.3;
                }

                break;
            }
            case '262': {
                for (let i = 1; i < settings.length; ++i) {
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

                for (let i = 1; i < settings.length; ++i) {
                    const f1 = settings.length - 1 - i;
                    const f2 = i - 1;
                    const k = 1 / (f1 + f2);

                    settings[i].share_price = k * (
                        f1 * (1 - mk_begin - rd_begin)
                        + f2 * (1 - mk_end - rd_end)
                    );
                    settings[i].share_mk = k * (f1 * mk_begin + f2 * mk_end);
                    settings[i].share_rd = k * (f1 * rd_begin + f2 * rd_end);
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

                break;
            }
            case 'easier': {
                if (typeof settings[1].loan_limit !== 'number') {
                    settings[1].loan_limit = 30000;
                }

                settings[1].loan_limit += 10000;

                break;
            }

            // AI
            case 'daybreak':
            case 'bouquet':
            case 'setsuna':
            case 'magnet':
            case 'melody': {
                onInitEvents.push((callback) => {
                    game.users['ai_' + i] = {
                        id: 'ai_' + i,
                        first_name: game.modes[i],
                        index: game.total,
                    };
                    game.total += 1;

                    callback();
                });

                onStartEvents.push((gameData, callback) => {
                    game.total -= 1;

                    callback(gameData);
                });

                onCloseEvents.push((gameData, callback) => {
                    core.ai(
                        gameData,
                        game.users['ai_' + i].index,
                        game.modes[i],
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
                    game.users['ai_' + i] = {
                        id: 'ai_' + i,
                        first_name: game.modes[i],
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
                        game.users['ai_' + i].index,
                        game.modes[i],
                        callback
                    );
                });
                onPeriodEvents.push(onStartEvents[onStartEvents.length - 1]);

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
