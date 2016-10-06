'use strict';

const fs = require('fs');
const config = require('./config');
const util = require('./util');
const tg = require('./server.tg');

process.on('uncaughtException', (err) => {
    util.log('uncaught exception'); // TODO
    util.err(err); // TODO
});

fs.readFile('token', (err, token) => {
    tg(token, config.tgInterval, [
        require('./site.tg'),
        require('./tgmese.tg'),
    ]);
});
