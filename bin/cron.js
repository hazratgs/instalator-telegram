const log = require('../libs/log')(module);
const cron = require('node-cron');

const Task = require('../app/controllers/task');
const Account = require('../app/controllers/account');
const Source = require('../app/controllers/source');
// const Instanode = require('../bin/instanode');

const instanode = require('./instanode');

// Запускаем активные задания
cron.schedule('23 11 * * *', () => {

    // Получаем все активные задания
    Task.currentList((err, tasks) => {
        if (!tasks.length) return null;

        tasks.forEach((item) => {

            // Поиск данных аккаунта
            new Promise((resolve, reject) => {
                Account.contains(item.user, item.login, (account) => resolve(account));
            }).then((account) => {

                // Поиск источника
                new Promise((resolve, reject) => {
                    Source.contains(item.source, (result) => resolve(result));
                }).then((source) => {

                    // Запускаем задачу
                    if (item.type === 'Лайк + Подписка'){
                        Instanode.follow(item, account[0], source[0].source);
                    }
                });
            });
        });
    });
});
