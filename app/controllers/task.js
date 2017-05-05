const conf = require('../../conf');
const log = require('../../libs/log')(module);
const db  = require('../../libs/db');

const Model  = require('../models/task');

// Добавить задание
exports.create = data => {
    return new Promise((resolve, reject) => {
        let Task = new Model.Task(data);
        Task.save((err) => {
            if (!err){
                resolve()
            } else {
                reject()
            }
        });
    });
};

// задание Лайк+Подписка
exports.createFollowLike = data => {
    return this.create({
        user: data.user,
        login: data.login,
        type: data.type,
        params: {
            sourceType: data.sourceType, // тип источника
            source: data.source, // источник
            actionFollow: data.action, // кол. подписок необходимо выполнить
            actionFollowDay: data.actionDay, // кол. в день
            actionLikeDay: data.like, // кол. лайков в день,
            following: [] // на кого подписались
        }
    })
};

// задание Отписка
exports.createUnFollow = data => {
    return this.create({
        user: data.user,
        login: data.login,
        type: data.type,
        params: {
            following: [], // подписки, от которых надо отписаться
            unFollowing: [], // список пользователей, от которых в этом задании отписались
            actionFollowingDay: data.actionFollowingDay, // кол. отписок в день
        }
    })
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
        Model.Task.findOne({
            user: user,
            login: login,
            status: 'active'
        }, (err, tasks) => {
            if (!err){
                if (tasks !== null){
                    resolve(tasks)
                } else {
                    reject('Нет активной задачи')
                }
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
        }, (err, tasks) => {
            if (!err){
                if (tasks.length){
                    resolve(tasks)
                } else {
                    reject(err)
                }
            } else {
                reject(err)
            }
        })
    });
};

// Завершение задания
exports.finish = id => {
    return new Promise((resolve, reject) => {
        Model.Task.update({
            _id: id
        }, {
            $set: {
                status: 'success'
            }
        }, (err) => {
            if (!err){
                resolve()
            } else {
                reject()
            }
        })
    });
};

// Отмена задания
exports.cancel = id => {
    return new Promise((resolve, reject) => {
        Model.Task.update({
            _id: id
        }, {
            $set: {
                status: 'cancel'
            }
        }, (err) => {
            if (!err){
                resolve()
            } else {
                reject()
            }
        })
    });
};

// Обновить список подписок
exports.followingUpdate = (id, data) => {
    return new Promise((resolve, reject) => {
        Model.Task.update({
            _id: id
        }, {
            $set: {
                'params.following': data
            }
        }, (err) => {
            if (!err){
                resolve()
            } else {
                reject(err)
            }
        })
    });
};

// Добавить пользователя в отписки
exports.unFollowAddUser = (id, user) => {
    return new Promise((resolve, reject) => {
        Model.Task.update({
            _id: id
        }, {
            $push: {
                'params.unFollowing': user
            }
        }, (err) => {
            if (!err){
                resolve()
            } else {
                reject(err)
            }
        })
    });
};

// Добавить пользователя в подписки
exports.addUserFollow = (id, user) => {
    return new Promise((resolve, reject) => {
        Model.Task.update({
            _id: id
        }, {
            $push: {
                'params.following': user
            }
        }, (err) => {
            if (!err){
                resolve()
            } else {
                reject(err)
            }
        })
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
        }, (err) => {
            if (!err){
                resolve()
            } else {
                reject(err)
            }
        })
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
        }, (err) => {
            if (!err){
                resolve()
            } else {
                reject(err)
            }
        })
    });
};

