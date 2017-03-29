'use strict';

let nconf = require('nconf');

nconf.argv()
    .env()
    .file({file: process.cwd() + '/conf/' + 'conf.json'});

module.exports = nconf;