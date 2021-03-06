'use strict';

const config = require('./config');
const util = require('./util');
const cache = require('./server.cache');
const wx = require('./server.wx');

process.on('uncaughtException', (err) => {
    util.err(Date());
    util.err(err);
});

util.log('cache init ' + config.wxCacheFile);

cache.init(
    config.wxCacheInterval,
    config.wxCacheFile,
    () => {
        util.log('bot init');

        // use adaptor
        wx(config.wxInterval, [
            require('./site.tg'),
            require('./tgmese.tg'),
        ], (bot) => {
            util.log('bot login');
        }, (bot) => {
            util.log('bot logout');
        });
    }
);
