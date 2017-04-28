const conf = require(process.cwd() + '/conf');
const log = require(process.cwd() + '/libs/log')(module);
const db  = require(process.cwd() + '/libs/db');

const Model  = require('../models/user');

/* Проверка существования пользователя */
exports.contains = id => {
    return new Promise((resolve, reject) => {
        Model.User.find({id: id}, (err, user) => resolve(user))
    })
};

/* Добавление нового пользователя */
exports.create = data => {
    return new Promise((resolve, reject) => {
        let CreateUser = new Model.User({
            id: data.id,
            name: data.name
        });
        CreateUser.save((err) => resolve(true))
    });
};

/* Очистка базы пользователей */
exports.cleaner = () => {
    return new Promise((resolve, reject) => {
        Model.User.remove({}, (err) => {
            console.log('Очистка: выполнено');
            resolve();
        });
    });
};