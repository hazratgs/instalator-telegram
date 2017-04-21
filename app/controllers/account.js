const conf = require('../../conf');
const log = require('../../libs/log')(module);
const db  = require('../../libs/db');

const Model  = require('../models/account');

// Список аккаунтов
exports.list = (user, callback) => {
    Model.Account.find({user: user}, (err, accounts) => callback(err, accounts))
};

// Добавление аккаунта
exports.add = (user, account, password, callback) => {
    let AddAccount = new Model.Account({
        user: user,
        account: account,
        password: password
    });
    AddAccount.save((err) => callback(err, AddAccount))
};

// Проверка существование аккаунта
exports.contains = (user, account, callback) => {
    Model.Account.find({
        user: user,
        account: account
    }, (err, account) => callback(account))
};

// Проверка существование аккаунта у всех пользователей
exports.containsAllUsers = (account, callback) => {
    Model.Account.find({
        account: account
    }, (err, result) => callback(result))
};

// Удаление аккаунта
exports.remove = (user, account, callback) => {
    Model.Account.remove({
        user: user,
        account: account
    }, () => callback())
};

// Записать информацию о подписке
exports.follow = (user, account, follow, callback) => {
    this.followList(user, account, (err, result) => {
        if (result){
            Model.AccountFollow.update({
                user: user,
                account: account
            }, {
                $push: {
                    data: follow
                }
            }, (err) => callback(err, result))

        } else {

            // База не найдена, добавляем базу
            new Model.AccountFollow({
                user: user,
                account: account,
                data: [follow]
            }).save((err) => callback(err))
        }
    });
};

// Список подписок пользователя
exports.followList = (user, account, callback) => {
    Model.AccountFollow.findOne({
        user: user,
        account: account
    }, (err, result) => {
        if (!err){
            callback(err, result);
        }
    });
};

// Проверить, подписан ли
exports.followCheck = (user, account, follow, callback) => {
    Model.AccountFollow.findOne({
        user: user,
        account: account,
        data: {$in: [follow]}
    }, (err, result) => result === null ? callback(false) : callback(true));
};

// Очистить список подписчиков
exports.followClear = (user, account, callback) => {
    Model.AccountFollow.update({
        user: user,
        account: account
    }, {
        $set: {
            data: []
        }
    }, (err) => callback(err))
};











