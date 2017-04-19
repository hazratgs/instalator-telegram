const conf = require('../../conf');
const log = require('../../libs/log')(module);
const db  = require('../../libs/db');

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

// Проверка существование аккаунта
exports.contains = (user, login, callback) => {
    Model.Account.find({
        user: user,
        login: login
    }, (err, accounts) => callback(accounts))
};

// Проверка существование аккаунта у всех пользователей
exports.containsAllUsers = (login, callback) => {
    Model.Account.find({
        login: login
    }, (err, result) => callback(result))
};

// Удаление аккаунта
exports.remove = (user, login, callback) => {
    Model.Account.remove({
        user: user,
        login: login
    }, () => callback())
};