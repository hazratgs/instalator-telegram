const conf = require('../../conf');
const log = require('../../libs/log')(module);
const db  = require('../../libs/db');

const Model  = require('../models/task');

// Добавить задание
exports.create = (data, callback) => {
    let Task = new Model.Task({
        user: data.user,
        login: data.login,
        type: data.type,
        source: data.source,
        action: data.action,
        actionPerDay: data.actionPerDay,
        like: data.like
    });
    Task.save((err) => callback(err));
};

// Список задач пользователя
exports.list = (user, callback) => {
    Model.Task.find({
        user: user
    }, (err, tasks) => callback(err, tasks))
};

// Текущее задание аккаунта
exports.current = (user, login, callback) => {
    Model.Task.find({
        user: user,
        login: login,
        status: 'active'
    }, (err, tasks) => callback(err, tasks))
};

// Активные задания
exports.currentList = (callback) => {
    Model.Task.find({
        status: 'active'
    }, (err, tasks) => callback(err, tasks))
};

// Завершение задания
exports.finish = (user, login, callback) => {
    Model.Task.update({
        user: user,
        login: login
    }, {
        $set: {
            status: 'success'
        }
    }, (err) => callback(err))
};

// Инкримент подписчиков
exports.currentIncrement = (user, login, callback) => {
    Model.Task.update({
        user: user,
        login: login
    }, {
        $inc: {
            current: 1
        }
    }, (err) => callback(err))
};

// Инкримент лайков
exports.likeIncrement = (user, login, callback) => {
    Model.Task.update({
        user: user,
        login: login
    }, {
        $inc: {
            like: 1
        }
    }, (err) => callback(err))
};

