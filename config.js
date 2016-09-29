'use strict';

module.exports = {
    // event loop
    interval: 1000,

    // timeout
    gatherTimeout: 600 * 1000,
    readyTimeout: 30 * 1000,
    closeTimeout: 30 * 1000,
    reportTimeout: 7200 * 1000,

    // engine
    meseEngine: './mese',
    meseMaxPlayer: 32, // TODO

    // game
    preset: 'modern',
    settings: [{}, {}, {}, {}, {}, {}, {}, {}],

    // bot
    botName: 'mese_bot',
    bot: {
        polling: true,
    },
};
