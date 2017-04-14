const conf = require(process.cwd() + '/conf');
const log = require(process.cwd() + '/libs/log')(module);
const db  = require(process.cwd() + '/libs/db');

const Model  = require('../models/source');

const source = ['myderbent_plus', 'tut.dagestan'];

// Источники
exports.list = () => {
    return source
};