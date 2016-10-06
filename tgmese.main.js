'use strict';

const fs = require('fs');
const config = require('./config');
const util = require('./util');
const tg = require('./server.tg');

process.on('uncaughtException', (err) => {
    util.log('uncaught exception');
    util.err(err);
});

fs.readFile('token', (err, token) => {
    util.log('bot init');

    tg(token, config.tgInterval, [
        require('./site.tg'),
        require('./tgmese.tg'),
    ]);
});
