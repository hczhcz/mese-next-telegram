'use strict';

module.exports = {
    tgInterval: 1000,
    tgGatherTimeout: 600 * 1000,
    tgGatherRemind: 30 * 1000,
    tgReadyTimeout: 30 * 1000,
    tgaccessInterval: 10 * 1000,
    tgaccessFile: '/dev/shm/tgmese',

    meseEngine: './mese',
    meseMaxPlayer: 32, // TODO

    tgmesePreset: 'modern',
    tgmeseSettings: [{}, {}, {}, {}, {}, {}, {}, {}],
    tgmeseCloseTimeout: 180 * 1000,
    tgmeseCloseRemind: 60 * 1000,
    tgmeseReportTimeout: 7200 * 1000,
};
