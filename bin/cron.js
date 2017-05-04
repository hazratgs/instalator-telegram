const log = require('../libs/log')(module);
const cron = require('node-cron');
const send = require('../app/bot/method');

const Task = require('../app/controllers/task');
const Instanode = require('./instanode');

// Активные задания
let activeTask = [];

// Запускаем активные задания
cron.schedule('* */1 * * *', () => {
    Task.currentList()
        .then(tasks => {
            console.log('-----------')
            console.log('Запуск задачи в ' + new Date());
            console.log('-----------')
            for (let item of tasks){
                console.log('Задача запущена для ' + item.login + ' в ' + new Date());
                let id = item._id.toString();

                // Пропускаем выполняющиеся задания
                if (activeTask.includes(id)) continue;

                switch (item.type){
                    case 'Лайк + Подписка':
                        activeTask.push(id);
                        Instanode.followLike(item)
                            .then(finish => {

                                // Удаляем из списка выполняемых
                                let keyActiveTask = activeTask.indexOf(id);
                                delete activeTask[keyActiveTask];

                                console.log('ЗАВЕРШЕНО для ' + item.login + ' в ' + new Date());

                                // оповещаем пользователя о завершении задания
                                if (finish){
                                    send.message(item.user, `Задание ${item.type} завершено для аккаунта ${item.login}`);
                                }
                            });
                        break;

                    case 'Отписка':
                        activeTask.push(id);
                        Instanode.unFollow(item)
                            .then(finish => {

                                // Удаляем из списка выполняемых
                                let keyActiveTask = activeTask.indexOf(id);
                                delete activeTask[keyActiveTask];

                                console.log('ЗАВЕРШЕНО для ' + item.login + ' в ' + new Date());

                                // оповещаем пользователя о завершении задания
                                if (finish){
                                    send.message(item.user, `Задание ${item.type} завершено для аккаунта ${item.login}`);
                                }
                            })
                            .catch(err => {
                               // Возникла ошибка, задание не выполнено
                                console.log(err);
                            });
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