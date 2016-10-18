'use strict';

module.exports = (game) => {
    let preset = 'modern';
    const settings = [{}, {}, {}, {}, {}, {}, {}, {}];

    const events = {
        onInit: (callback) => {
            callback(preset, settings);
        },

        afterInit: (gameData, callback) => {
            callback(gameData);
        },

        onClose: (gameData, callback) => {
            callback(gameData);
        },

        afterClose: (gameData, callback) => {
            callback(gameData);
        },
    };

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

    return events;
};
