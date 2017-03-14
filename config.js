'use strict';

module.exports = {
    cacheInterval: 5 * 1000,
    cacheFile: '/dev/shm/tgmese',

    gatherMaxModes: 16,
    gatherTimeout: 300 * 1000,
    gatherReadyTimeout: 30 * 1000,
    gatherInitTimeout: 30 * 1000,

    tgInterval: 1000,
    tgMessage: 'Hello from MESE bot\n',

    meseEngine: './mese',
    meseMaxPlayers: 32,

    tgmeseCloseTimeout: 120 * 1000,
    tgmeseCloseRemind: 30 * 1000,
    tgmeseReportTimeout: 7200 * 1000,
    tgmeseTwoPassAI: true,
};
