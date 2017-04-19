const conf = require('../../conf');
const log = require('../../libs/log')(module);
const db  = require('../../libs/db');

const Model  = require('../models/task');

// Добавить задание
exports.create = (data, callback) => {
    let Task = new Model.Task({
        user: data.name,
        type: data.type,
        source: data.source,
        action: data.action,
        actionPerDay: data.actionPerDay,
        like: data.like,
    });
    Task.save((err) => callback(err));
};