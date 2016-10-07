'use strict';

const fs = require('fs');

const config = require('./config');
const util = require('./util');
const cache = require('./server.cache');
const tg = require('./server.tg');

process.on('uncaughtException', (err) => {
    util.log('uncaught exception');
    util.err(err);
});

util.log('cache init ' + config.cacheFile);

cache.init(
    config.cacheInterval,
    config.cacheFile,
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
