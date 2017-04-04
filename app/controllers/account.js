const conf = require(process.cwd() + '/conf');
const log = require(process.cwd() + '/libs/log')(module);
const db  = require(process.cwd() + '/libs/db');

const Model  = require('../models/account');

// Список аккаунтов
exports.list = (user, callback) => {
    Model.Account.find({user: user}, (err, accounts) => callback(err, accounts))
};

// Добавление аккаунта
exports.add = (user, login, password, callback) => {
    let AddAccount = new Model.Account({
        user: user,
        login: login,
        password: password
    });
    AddAccount.save((err) => callback(err, AddAccount))
};

/*  */