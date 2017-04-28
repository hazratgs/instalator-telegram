const conf = require(process.cwd() + '/conf');
const log = require(process.cwd() + '/libs/log')(module);
const db  = require(process.cwd() + '/libs/db');

const Model  = require('../models/source');

// Источники
exports.list = () => {
    return new Promise((resolve, reject) => {
        Model.Source.find({}, (err, result) => {
            if (!err){
                result.length ? resolve(result) : reject(err)
            } else {
                reject(err)
            }
        })
    });
};

// Добавить новый источник
exports.create = data => {
    return new Promise((resolve, reject) => {
        let Source = new Model.Source({
            name: data.name,
            source: data.source,
            count: data.source.length
        });
        Source.save((err) => resolve(Source));
    });
};

// Проверить существование источника
exports.contains = name => {
    return new Promise((resolve, reject) => {
        Model.Source.find({name: name}, (err, source) => {
            if (!err){
                source.length ? resolve(source) : reject(err)
            } else {
                reject(err)
            }
        })
    });
};

// Удаление
exports.remove = name => {
    return new Promise((resolve, reject) => {
        Model.Source.remove({name: name}, (err, source) => resolve(source))
    });
};