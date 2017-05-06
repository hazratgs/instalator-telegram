const log = require('../libs/log')(module);
const cron = require('node-cron');
const send = require('../app/bot/method');

const Task = require('../app/controllers/task');
const Instanode = require('./instanode');

// Активные задания
let activeTask = [];

// Запускаем активные задания
cron.schedule('00 */1 * * *', () => {
    Task.currentList()
        .then(tasks => {
            for (let item of tasks){

                let id = item._id.toString();

                // Пропускаем выполняющиеся задания
                if (activeTask.includes(id)) continue;

                log.debug('Start %s %s', item.login, new Date());

                switch (item.type){
                    case 'Лайк + Подписка':
                        activeTask.push(id);
                        Instanode.followLike(item)
                            .then(finish => {

                                // Удаляем из списка выполняемых
                                let keyActiveTask = activeTask.indexOf(id);
                                delete activeTask[keyActiveTask];

                                log.debug('Stop %s, time %s', item.login, new Date());

                                // оповещаем пользователя о завершении задания
                                if (finish){
                                    send.message(item.user, `Задание ${item.type} завершено для аккаунта ${item.login}`);
                                }
                            })
                            .catch(err => log.error(err));
                        break;

                    case 'Отписка':
                        activeTask.push(id);
                        Instanode.unFollow(item)
                            .then(finish => {

                                // Удаляем из списка выполняемых
                                let keyActiveTask = activeTask.indexOf(id);
                                delete activeTask[keyActiveTask];

                                log.debug('Stop %s, time %s', item.login, new Date());

                                // оповещаем пользователя о завершении задания
                                if (finish){
                                    send.message(item.user, `Задание ${item.type} завершено для аккаунта ${item.login}`);
                                }
                            })
                            .catch(err => log.error(err));
                        break;

                    default:
                        break;
                }
            }
        })
        .catch(err => {
            // Нет активных заданий
        });
});