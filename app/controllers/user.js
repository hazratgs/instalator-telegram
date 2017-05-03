const conf = require(process.cwd() + '/conf');
const log = require(process.cwd() + '/libs/log')(module);
const db  = require(process.cwd() + '/libs/db');

const Model  = require('../models/user');

/* Проверка существования пользователя */
exports.contains = id => {
    return new Promise((resolve, reject) => {
        Model.User.findOne({id: id}, (err, user) => {
            if (!err){
                if (user !== null){
                    resolve(user)
                } else {
                    reject(err)
                }
            } else {
                reject(err)
            }
        })
    })
};

/* Добавление нового пользователя */
exports.create = data => {
    return new Promise((resolve, reject) => {
        let CreateUser = new Model.User({
            id: data.id,
            name: data.name
        });
        CreateUser.save((err) => {
            if (!err){
                resolve(true)
            } else {
                reject(err)
            }
        })
    });
};

/* Очистка базы пользователей */
exports.cleaner = () => {
    return new Promise((resolve, reject) => {
        Model.User.remove({}, (err) => {
            if (!err){
                console.log('Очистка: выполнено');
                resolve();
            } else {
                reject(err)
            }
        });
    });
};