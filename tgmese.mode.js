'use strict';

module.exports = (game) => {
    return {
        onInit: (callback) => {
            callback(
                'modern',
                [{}, {}, {}, {}, {}, {}, {}, {}]
            );
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
