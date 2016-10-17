'use strict';

module.exports = (game) => {
    let preset = 'modern';
    let settings = [{}, {}, {}, {}, {}, {}, {}, {}];

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
};
