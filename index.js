/*!
 * instalator-telegram
 * Copyright(c) 2017 Hazrat Gadjikerimov
 * MIT Licensed
 */

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Winston Log
const log = require('./libs/log')(module);

// Поддержка JSON
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '5mb'
}));

// HTTP Сервер
const server = require('./bin/server');

// Роуты приложения
const routes = require('./app/routes');

// Telegram bot
const bot = require('./app/bot');

// Запланированные задачи
const cron = require('./bin/cron');

// Отдача статики
app.use(express.static(process.cwd() + '/public'));

// Основной роутер
routes(app);

// Запуск сервера
server.create(app);
