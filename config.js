'use strict';

module.exports = {
    cacheInterval: 10 * 1000,
    cacheFile: '/dev/shm/tgmese',

    tgInterval: 1000,
    tgGatherTimeout: 600 * 1000,
    tgGatherRemind: 30 * 1000,
    tgReadyTimeout: 30 * 1000,
    tgInitTimeout: 3 * 1000,
    tgMessage: 'Hello from MESE bot\n',

    meseEngine: './mese',
    meseMaxPlayer: 32, // TODO

    tgmesePreset: 'modern',
    tgmeseSettings: [{}, {}, {}, {}, {}, {}, {}, {}],
    tgmeseCloseTimeout: 180 * 1000,
    tgmeseCloseRemind: 60 * 1000,
    tgmeseReportTimeout: 7200 * 1000,
};
