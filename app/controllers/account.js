const conf = require(process.cwd() + '/conf');
const log = require(process.cwd() + '/libs/log')(module);
const db  = require(process.cwd() + '/libs/db');

const Model  = require('../models/account');

/* Список аккаунтов */
exports.list = (user, callback) => {
    Model.User.find({user: user}, (err, accounts) => callback(err, accounts))
};