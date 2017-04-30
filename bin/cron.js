const log = require('../libs/log')(module);
const cron = require('node-cron');

const Task = require('../app/controllers/task');
const Instanode = require('./instanode');
const Client = require('instagram-private-api').V1;

// Активные задания
let activeTask = [];

// Запускаем активные задания
cron.schedule('*/5' +
    ' * * * * *', () => {
    Task.currentList()
        .then(tasks => {
            for (let item of tasks){
                let id = item._id.toString();

                // Пропускаем выполняющиеся задания
                if (activeTask.includes(id)) continue;

                switch (item.type){
                    case 'Лайк + Подписка':
                        activeTask.push(id);
                        break;

                    case 'Отписка':
                        activeTask.push(id);
                        Instanode.unFollow(item)
                            .then(res => {

                                // Удаляем из списка выполняемых
                                let keyActiveTask = activeTask.indexOf(id);
                                delete activeTask[keyActiveTask];
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