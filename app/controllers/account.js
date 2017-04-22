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
    }, (err, account) => callback(account))
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

// Записать информацию о подписке
exports.follow = (user, login, follow, callback) => {
    this.followList(user, login, (err, result) => {
        if (result){
            Model.AccountFollow.update({
                user: user,
                login: login
            }, {
                $push: {
                    data: follow
                }
            }, (err) => callback(err, result))

        } else {

            // База не найдена, добавляем базу
            new Model.AccountFollow({
                user: user,
                login: login,
                data: [follow]
            }).save((err) => callback(err))
        }
    });
};

// Список подписок пользователя
exports.followList = (user, login, callback) => {
    Model.AccountFollow.findOne({
        user: user,
        login: login
    }, (err, result) => {
        if (!err){
            callback(err, result);
        }
    });
};

// Проверить, подписан ли
exports.followCheck = (user, login, follow, callback) => {
    Model.AccountFollow.findOne({
        user: user,
        login: login,
        data: {$in: [follow]}
    }, (err, result) => result === null ? callback(false) : callback(true));
};

// Очистить список подписчиков
exports.followClear = (user, login, callback) => {
    Model.AccountFollow.update({
        user: user,
        login: login
    }, {
        $set: {
            data: []
        }
    }, (err) => callback(err))
};

// Записать информацию о лайке
exports.like = (user, login, like, callback) => {
    this.likeList(user, login, (err, result) => {
        if (result){
            Model.AccountLike.update({
                user: user,
                login: login
            }, {
                $push: {
                    data: like
                }
            }, (err) => callback(err, result))

        } else {

            // База не найдена, добавляем базу
            new Model.AccountLike({
                user: user,
                login: login,
                data: [like]
            }).save((err) => callback(err))
        }
    });
};

// Список лайков пользователя
exports.likeList = (user, login, callback) => {
    Model.AccountLike.findOne({
        user: user,
        login: login
    }, (err, result) => {
        if (!err){
            callback(err, result);
        }
    });
};

// Проверить, лайкнул ли
exports.likeCheck = (user, login, like, callback) => {
    Model.AccountLike.findOne({
        user: user,
        login: login,
        data: {$in: [like]}
    }, (err, result) => result === null ? callback(false) : callback(true));
};









