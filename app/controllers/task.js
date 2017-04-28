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
            params: {
                source: data.source, // источник
                actionFollow: data.action, // кол. подписок необходимо выполнить
                actionFollowDay: data.actionDay, // кол. в день
                actionLikeDay: data.like // кол. лайков в день
            }
        });
        Task.save((err) => {
            if (!err){
                resolve()
            } else {
                reject()
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
            if (!err){
                tasks.length ? resolve(tasks) : reject(err)
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

