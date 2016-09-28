'use strict';

module.exports = {
    // event loop
    interval: 1000,

    // gathering
    gatherTimeout: 600000,
    readyTimeout: 30000,

    // engine
    meseEngine: './mese',
    meseMaxPlayer: 32, // TODO

    // playing
    closeTimeout: 300000,
    preset: 'modern',
    settings: [{}, {}, {}, {}, {}, {}, {}, {}],

    // bot
    botName: 'mese_bot',
    bot: {
        polling: true,
    },
};
