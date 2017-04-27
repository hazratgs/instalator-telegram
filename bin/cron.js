const log = require('../libs/log')(module);
const cron = require('node-cron');

const Task = require('../app/controllers/task');
const Account = require('../app/controllers/account');
const Source = require('../app/controllers/source');
const Instanode = require('../bin/instanode');

const instanode = require('./instanode');

// Запускаем активные задания
cron.schedule('*/5 * * * * *', () => {

    // Получаем все активные задания
    Task.currentList((err, tasks) => {
        if (!tasks.length) return null;

        tasks.forEach((item) => {

            switch (item.type){
                case 'Лайк + Подписка':

                    break;

                case 'Отписка':
                    break;

                default:
                    break;
            }
        });
    });
});


