'use strict';

module.exports = (game) => {
    return {
        onInit: (callback) => {
            callback(
                'modern',
                [{}, {}, {}, {}, {}, {}, {}, {}]
            );
        },
    };
};
