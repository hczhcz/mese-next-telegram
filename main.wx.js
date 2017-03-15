'use strict';

const config = require('./config');
const util = require('./util');
const cache = require('./server.cache');
const wx = require('./server.wx');

process.on('uncaughtException', (err) => {
    util.log('uncaught exception');
    util.err(err);
});

util.log('cache init ' + config.cacheFile);

cache.init(
    config.cacheInterval,
    config.cacheFile,
    () => {
        util.log('bot init');

        wx(config.wxInterval, [
            // require('./site.wx'),
            // require('./tgmese.wx'),
        ]);
    }
);
