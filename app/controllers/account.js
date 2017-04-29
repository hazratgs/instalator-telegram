const conf = require('../../conf');
const log = require('../../libs/log')(module);
const db  = require('../../libs/db');

const Model  = require('../models/account');

// Список аккаунтов
exports.list = (user) => {
    return new Promise((resolve, reject) => {
        Model.Account.find({user: user}, (err, result) => {
            if (!err){
                if (result.length){
                    resolve(result)
                } else {
                    reject(err)
                }
            } else {
                reject(err)
            }
        })
    });
};

// Добавление аккаунта
exports.add = (user, login, password) => {
    return new Promise((resolve, reject) => {
        let addAccount = new Model.Account({
            user: user,
            login: login,
            password: password
        });
        addAccount.save((err) => {
            if (!err){
                resolve(addAccount)
            } else {
                reject(err)
            }
        })
    });
};

// Проверка существование аккаунта
exports.contains = (user, login) => {
    return Promise((resolve, reject) => {
        Model.Account.find({
            user: user,
            login: login
        }, (err, result) => {
            if (!err){
                if (result.length){
                    resolve(result)
                } else {
                    reject(err)
                }
            } else {
                reject(err)
            }
        })
    });
};

// Проверка существование аккаунта у всех пользователей
exports.containsAllUsers = (login) => {
    return new Promise((resolve, reject) => {
        Model.Account.find({
            login: login
        }, (err, result) => {
            if (!err){
                if (result.length){
                    resolve(result)
                } else {
                    reject(err)
                }
            } else {
                reject(err)
            }
        })
    });
};

// Удаление аккаунта
exports.remove = (user, login) => {
    return new Promise((resolve, reject) => {
        Model.Account.remove({
            user: user,
            login: login
        }, (err) => {
            if (!err){
                resolve()
            } else {
                reject(err)
            }
        })
    });

};

// Записать информацию о подписке
exports.follow = (user, login, follow) => {
    let self = this;
    return new Promise(async (resolve, reject) => {
        await self.followList(user, login)
            .then((result) => {
                if (result){
                    Model.AccountFollow.update({
                        user: user,
                        login: login
                    }, {
                        $push: {
                            data: follow
                        }
                    }, (err) => resolve())
                } else {

                    // База не найдена, добавляем базу
                    new Model.AccountFollow({
                        user: user,
                        login: login,
                        data: [follow]
                    }).save(() => resolve())
                }
            });
    });
};

// Список подписок пользователя
exports.followList = (user, login) => {
    return new Promise((resolve, reject) => {
        Model.AccountFollow.findOne({
            user: user,
            login: login
        }, (err, result) => {
            if (!err){
                if (result.length){
                    resolve(result)
                } else {
                    reject(err)
                }
            } else {
                reject(err)
            }
        });
    });
};

// Проверить, подписан ли
exports.followCheck = (user, login, follow) => {
    return new Promise((resolve, reject) => {
        Model.AccountFollow.findOne({
            user: user,
            login: login,
            data: {$in: [follow]}
        }, (err, result) => {
            if (!err){
                if (result.length){
                    resolve(result)
                } else {
                    reject(err)
                }
            } else {
                reject(err)
            }
        });
    });
};

// Очистить список подписчиков
exports.followClear = (user, login, callback) => {
    return new Promise((resolve, reject) => {
        Model.AccountFollow.update({
            user: user,
            login: login
        }, {
            $set: {
                data: []
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

// Записать информацию о лайке
exports.like = (user, login, like) => {
    let self = this;
    return new Promise((resolve, reject) => {
        self.likeList(user, login)
            .then(result => {
                if (result){
                    Model.AccountLike.update({
                        user: user,
                        login: login
                    }, {
                        $push: {
                            data: like
                        }
                    }, (err) => {
                        if (!err){
                            resolve()
                        } else {
                            reject()
                        }
                    })
                } else {

                    // База не найдена, добавляем базу
                    new Model.AccountLike({
                        user: user,
                        login: login,
                        data: [like]
                    }).save((err) => {
                        if (!err){
                            resolve()
                        } else {
                            reject()
                        }
                    })
                }
            })
    });
};

// Список лайков пользователя
exports.likeList = (user, login) => {
    return new Promise((resolve, reject) => {
        Model.AccountLike.findOne({
            user: user,
            login: login
        }, (err, result) => {
            if (!err){
                if (result.length){
                    resolve(result)
                    result ? resolve(result) : reject(err)
                } else {
                    reject(err)
                }
            } else {
                reject(err)
            }
        });
    });
};

// Проверить, лайкнул ли
exports.likeCheck = (user, login, like) => {
    return new Promise((resolve, reject) => {
        Model.AccountLike.findOne({
            user: user,
            login: login,
            data: {$in: [like]}
        }, (err, result) => {
            if (!err){
                if (result.length){
                    resolve(true)
                } else {
                    resolve(false)
                }
            } else {
                resolve(false)
            }
        });
    });
};









