'use strict';

const config = require('./config');
const tg = require('./server.tg');

process.on('uncaughtException', (err) => {
    util.log('uncaught exception');
    util.err(err);
});

tg(config.tgInterval, [
    require('./site.tg'),
    require('./tgmese.tg'),
]);
