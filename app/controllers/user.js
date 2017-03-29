const conf = require(process.cwd() + '/conf');
const log = require(process.cwd() + '/libs/log')(module);
const db  = require(process.cwd() + '/libs/db');

const Model  = require('../models/user');

/* Проверка существования пользователя */
exports.contains = (id, callback) => {
    Model.User.find({id: id}, (err, users) => callback(err, users))
};

/* Добавление нового пользователя */
exports.create = (data, callback) => {
    let CreateUser = new Model.User({
        id: data.id,
        name: data.name
    });
    CreateUser.save((err) => callback(err, CreateUser))
};

/* Очистка базы пользователей */
exports.cleaner = () => {
    Model.User.remove({}, (err) => {
        console.log('Очистка: выполнено');
    });
};