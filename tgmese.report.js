'use strict';

module.exports = {
    list: (report) => {
        return ['test1', 'test2'];
    },

    content: (report, section) => {
        return 'test:' + section;
    },
};
