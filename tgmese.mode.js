'use strict';

module.exports = (game) => {
    let preset = 'modern';
    const settings = [{}, {}, {}, {}, {}, {}, {}, {}];

    const onInitEvents = [];
    const afterInitEvents = [];
    const onCloseEvents = [];
    const afterCloseEvents = [];

    for (const i in game.modes) {
        switch (game.modes[i]) {
            case 'classic':
            case 'imese':
            case 'modern': {
                preset = game.modes[i];

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

        afterInit: (gameData, callback) => {
            let i = -1;

            const exec = (newData) => {
                i += 1;

                if (i < afterInitEvents.length) {
                    afterInitEvents[i](newData, exec);
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

        afterClose: (gameData, callback) => {
            let i = -1;

            const exec = (newData) => {
                i += 1;

                if (i < afterCloseEvents.length) {
                    afterCloseEvents[i](newData, exec);
                } else {
                    callback(newData);
                }
            };

            exec(gameData);
        },
    };
};
