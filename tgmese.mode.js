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
            // preset
            case 'classic':
            case 'imese':
            case 'modern': {
                preset = game.modes[i];

                break;
            }

            // share
            case '343': {
                settings[1].share_price = 0.2;
                settings[1].share_mk = 0.6;
                settings[1].share_rd = 0.2;

                break;
            }
            case '262': {
                settings[1].share_price = 0.2;
                settings[1].share_mk = 0.6;
                settings[1].share_rd = 0.2;

                break;
            }

            // loan
            case 'survive': {
                settings[1].loan_limit = 0;

                break;
            }

            // AI
            case 'daybreak':
            case 'bouquet':
            case 'setsuna':
            case 'magnet': {
                onInitEvents.push((callback) => {
                    game.users['ai_' + game.modes[i]] = {
                        id: 'ai_' + game.modes[i],
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
                        game.users['ai_' + game.modes[i]].index,
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
                    game.users['ai_' + game.modes[i]] = {
                        id: 'ai_' + game.modes[i],
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
                        game.users['ai_' + game.modes[i]].index,
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
