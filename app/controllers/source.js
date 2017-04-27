const conf = require(process.cwd() + '/conf');
const log = require(process.cwd() + '/libs/log')(module);
const db  = require(process.cwd() + '/libs/db');

const Model  = require('../models/source');

// Источники
exports.list = (callback) => {
    Model.Source.find({}, (err, result) => callback(result))
};

// Добавить новый источник
exports.create = (data, callback) => {
    let Source = new Model.Source({
        name: data.name,
        source: data.source,
        count: data.source.length
    });
    Source.save((err) => callback(err, Source));
};

// Проверить существование источника
exports.contains = (name) => {
    return new Promise((resolve) => {
        Model.Source.find({name: name}, (err, source) => resolve(source))
    });
};

// Удаление
exports.remove = (name, callback) => {
    Model.Source.remove({name: name}, (err, source) => callback(source))
};