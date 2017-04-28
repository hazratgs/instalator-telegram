const conf = require('../../conf');
const log = require('../../libs/log')(module);
const db  = require('../../libs/db');

const Model  = require('../models/task');

// Добавить задание
exports.create = data => {
    return new Promise((resolve, reject) => {
        let Task = new Model.Task({
            user: data.user,
            login: data.login,
            type: data.type,
            source: data.source,
            action: data.action,
            actionPerDay: data.actionPerDay,
            like: data.like
        });
        Task.save((err) => {
            if (!err){
                resolve(true)
            } else {
                reject(false)
            }
        });
    });
};

// Список задач пользователя
exports.list = user => {
    return new Promise((resolve, reject) => {
        Model.Task.find({
            user: user
        }, (err, tasks) => resolve(tasks))
    });
};

// Текущее задание аккаунта
exports.current = (user, login) => {
    return new Promise((resolve, reject) => {
        Model.Task.find({
            user: user,
            login: login,
            status: 'active'
        }, (err, tasks) => {
            if (!err || tasks){
                resolve(tasks)
            } else {
                reject(err)
            }
        })
    });
};

// Активные задания
exports.currentList = () => {
    return new Promise((resolve, reject) => {
        Model.Task.find({
            status: 'active'
        }, (err, tasks) => resolve(tasks))
    });
};

// Завершение задания
exports.finish = (user, login) => {
    return new Promise((resolve, reject) => {
        Model.Task.update({
            user: user,
            login: login
        }, {
            $set: {
                status: 'success'
            }
        }, (err) => resolve())
    });
};

// Инкримент подписчиков
exports.currentIncrement = (user, login) => {
    return new Promise((resolve, reject) => {
        Model.Task.update({
            user: user,
            login: login
        }, {
            $inc: {
                current: 1
            }
        }, (err) => resolve(err))
    });
};

// Инкримент лайков
exports.likeIncrement = (user, login) => {
    return new Promise((resolve, reject) => {
        Model.Task.update({
            user: user,
            login: login
        }, {
            $inc: {
                likeCurrent: 1
            }
        }, (err) => resolve(err))
    });
};

