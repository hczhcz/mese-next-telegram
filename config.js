'use strict';

module.exports = {
    cacheInterval: 5 * 1000,
    cacheFile: '/dev/shm/tgmese',

    tgInterval: 1000,
    tgMaxModes: 16,
    tgGatherTimeout: 300 * 1000,
    tgReadyTimeout: 30 * 1000,
    tgInitTimeout: 30 * 1000,
    tgMessage: 'Hello from MESE bot\n',

    meseEngine: './mese',
    meseMaxPlayers: 32,

    tgmeseCloseTimeout: 120 * 1000,
    tgmeseCloseRemind: 30 * 1000,
    tgmeseReportTimeout: 7200 * 1000,
    tgmeseTwoPassAI: true,
};
