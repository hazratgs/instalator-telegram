'use strict';

// Mongo DB
let mongoose = require('mongoose'),
    conf = require('../conf'),
    log = require('./log')(module);

mongoose.Promise = global.Promise;
mongoose.connect(conf.get('mongoose:uri'));
let db = mongoose.connection;

db.on('error', (err) => {
    log.error('connection error:', err.message);
});
db.once('open', () => {
    log.info("Connected to DB!");
});

// MongoDB
exports.mongoose = mongoose;

// This DB
exports.connect = db;