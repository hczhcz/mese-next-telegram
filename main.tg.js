'use strict';

const fs = require('fs');

const config = require('./config');
const util = require('./util');
const cache = require('./server.cache');
const tg = require('./server.tg');

process.on('uncaughtException', (err) => {
    util.log('uncaught exception');
    util.err(Date());
    util.err(err);
});

util.log('cache init ' + config.tgCacheFile);

cache.init(
    config.tgCacheInterval,
    config.tgCacheFile,
    () => {
        fs.readFile('token', (err, data) => {
            if (err) {
                throw Error('no token');
            }

            util.log('bot init');

            tg(data, config.tgInterval, [
                require('./site.tg'),
                require('./tgmese.tg'),
            ]);
        });
    }
);
