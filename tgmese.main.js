'use strict';

const config = require('./config');
const util = require('./util');
const tg = require('./server.tg');

process.on('uncaughtException', (err) => {
    util.log('uncaught exception'); // TODO
    util.err(err); // TODO
});

tg(config.tgInterval, [
    require('./site.tg'),
    require('./tgmese.tg'),
]);
