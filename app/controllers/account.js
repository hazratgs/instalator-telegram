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
            login: login.toLowerCase(),
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
    return new Promise((resolve, reject) => {
        Model.Account.findOne({
            user: user,
            login: login
        }, (err, result) => {
            if (!err){
                resolve(result)
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

                // При удалении также необходимо удалить задачу

            } else {
                reject(err)
            }
        })
    });

};

// Записать информацию о подписке
exports.following = (user, login, follow) => {
    return new Promise((resolve, reject) => {
        this.checkFollowing(user, login, follow)
            .then(() => reject())
            .catch(() => {
                this.addFollowing(user, login, follow)
                    .then(() => {
                        resolve()
                    });
            });
    });
};

// Проверить подписку
exports.checkFollowing = (user, login, follow) => {
    return new Promise((resolve, reject) => {
        Model.AccountFollow.findOne({
            user: user,
            login: login,
            data: {
                '$in': [follow] // []
            }
        }, (err, result) => {
            if (!err){
                if (result !== null){
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

// Добавить подписчика в историю
exports.addFollowing = (user, login, follow) => {
    return new Promise((resolve, reject) => {
        this.followList(user, login)
            .then(() => {
                Model.AccountFollow.update({
                    user: user,
                    login: login
                }, {
                    $push: {
                        data: follow
                    }
                }, (err) => resolve())
            })
            .catch(() => {
                new Model.AccountFollow({ // Запись не найдена, добавляем
                    user: user,
                    login: login,
                    data: follow
                }).save((err) => resolve())
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
                if (result !== null){
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
exports.followClear = (user, login) => {
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
    return new Promise((resolve, reject) => {
        this.checkLike(user, login, like)
            .then(() => reject())
            .catch(() => {
                this.addLike(user, login, like)
                    .then(() => {
                        resolve()
                    });
            });
    });
};

// Проверить, лайкнул ли
exports.checkLike = (user, login, like) => {
    return new Promise((resolve, reject) => {
        Model.AccountLike.findOne({
            user: user,
            login: login,
            data: {
                '$in': [like]
            }
        }, (err, result) => {
            if (!err){
                if (result !== null){
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

// Добавить подписчика лайк
exports.addLike = (user, login, like) => {
    return new Promise((resolve, reject) => {
        this.likeList(user, login)
            .then(() => {
                Model.AccountLike.update({
                    user: user,
                    login: login
                }, {
                    $push: {
                        data: like
                    }
                }, (err) => resolve())
            })
            .catch(() => {
                new Model.AccountLike({ // Запись не найдена, добавляем
                    user: user,
                    login: login,
                    data: like
                }).save((err) => resolve())
            });

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
                if (result !== null){
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









