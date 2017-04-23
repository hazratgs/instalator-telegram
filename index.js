/*!
 * nodeapp
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

const Client = require('instagram-private-api').V1;
const device = new Client.Device('halicha.ru');
const storage = new Client.CookieFileStorage('./cookies/halicha.ru.txt');
const _ = require('underscore');
const Promise = require('bluebird');

// And go for login
Client.Session.create(device, storage).then((session) => {
    return [session, Client.Account.searchForUser(session, 'febox26')]
}).spread((session, account) => {
    let feed = new Client.Feed.AccountFollowing(session, account.id);

    Promise.mapSeries(_.range(0, 50), async () => {
        let result;

        let func = async () => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    result = feed.get();
                    resolve();
                }, 2000)
            });
        };

        await func();

        return result;
    }).then((results) => {
        let followers = [];

        for (let item of results){
            for (let user of item){
                followers.push(user._params.username);
            }
        }

        console.log(followers.length)
    })
});
