'use strict';

const config = require('./config');
const tg = require('./server.tg');

tg(config.tgInterval, [
    require('./site.tg'),
    require('./tgmese.tg'),
]);
