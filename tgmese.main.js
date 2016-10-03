'use strict';

const config = require('./config');
const tg = require('./server.tg');

process.on('uncaughtException', (err) => {
    console.log('uncaught exception'); // TODO
    console.err(err); // TODO
});

tg(config.tgInterval, [
    require('./site.tg'),
    require('./tgmese.tg'),
]);
