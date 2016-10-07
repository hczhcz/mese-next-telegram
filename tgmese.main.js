'use strict';

const fs = require('fs');
const config = require('./config');
const util = require('./util');
const tg = require('./server.tg');
const tgaccess = require('./server.tgaccess');

process.on('uncaughtException', (err) => {
    util.log('uncaught exception');
    util.err(err);
});

util.log('cache init ' + config.tgaccessFile);

tgaccess.init(
    config.tgaccessInterval,
    config.tgaccessFile,
    () => {
        fs.readFile('token', (err, data) => {
            util.log('bot init');

            tg(data, config.tgInterval, [
                require('./site.tg'),
                require('./tgmese.tg'),
            ]);
        });
    }
);
