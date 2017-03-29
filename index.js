'use strict';

/*!
 * nodeapp
 * Copyright(c) 2017 Hazrat Gadjikerimov
 * MIT Licensed
 */

const express = require('express');
const app = express();

// Winston Log
const log = require('./libs/log')(module);

// HTTP Сервер
const server = require('./bin/server');

// Роуты приложения
const routes = require('./app/routes');

// Telegram bot
const bot = require('./app/bot');

// Отдача статики
app.use(express.static(process.cwd() + '/public'));

// Основной роутер
routes(app);

// Запуск сервера
server.create(app);