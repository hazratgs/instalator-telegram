const Account = require('../../controllers/account');
const Source = require('../../controllers/source');
const Task = require('../../controllers/task');
const instanode = require('../../../bin/instanode');

module.exports = (event, state, log, map, send) => {

    // Активность пользователя
    event.on('actions', (msg, action, next) => {
        Account.list(msg.from.id)
            .then(accounts => {
                let elements = accounts.map((item) => item.login);
                send.keyboard(msg.from.id, 'Выберите аккаунт', [...elements, 'Назад']);
                next ? next() : null
            })

            // Аккаунтов нет, предлогаем добавить
            .catch(err => {
                send.keyboard(msg.from.id, 'У вас нет ни одного аккаунта', ['Назад'])
                next ? next() : null
            })
    });

    // Вывод информации об активности Аккаунта
    event.on('actions:account', async (msg, action, next) => {
        try {
            let account = await Account.contains(msg.from.id, msg.text);
            let task = await Task.current(msg.from.id, msg.text);

            let text = '';
            let daily = '';

            switch (task.type){
                case 'Лайк + Подписка':
                    daily = Math.round((task.params.actionFollow - task.params.following.length) / task.params.actionFollowDay);
                    text = `Активность ${task.login}\nТип задачи: ${task.type}\nСостояние: ${task.params.actionFollow}/${task.params.following.length}\nПодписок в день: ${task.params.actionFollowDay}\nЛайков в день: ${task.params.actionLikeDay}\nИсточник: ${task.params.source}\nДата завершения: ${daily} дней`;
                    break;

                case 'Отписка':
                    daily = Math.round((task.params.following.length - task.params.unFollowing.length) / task.params.actionFollowingDay);
                    text = `Активность ${task.login}\nТип задачи: ${task.type}\nСостояние: ${task.params.following.length}/${task.params.unFollowing.length}\nОтписок в день: ${task.params.actionFollowingDay}\nДата завершения: ${daily} дней`;
                    break;

                default:
                    break
            }

            send.keyboard(msg.from.id, text, ['Редактировать', 'Отменить', 'Назад']);
            next ? next() : null
        } catch (err){
            send.message(msg.from.id, 'Нет активного задания');
            next ? next() : null;

            event.emit('location:back', msg);
        }
    });

    // Отмена задачи
    event.on('actions:account:cancel', async (msg, action, next) => {
        try {
            let data = state[msg.from.id];
            let account = await Account.contains(msg.from.id, data[1]);
            let task = await Task.current(msg.from.id, data[1]);

            Task.cancel(task._id);
            send.message(msg.from.id, `🔴 Задание ${task.type} отменена`);

            event.emit('location:back', msg);
        } catch (err){
            send.message(msg.from.id, 'Возникла ошибка, повторите');
            next ? next() : null;

            event.emit('location:back', msg);
        }
    });

    // Редактирование задачи
    event.on('actions:account:update', async (msg, action, next) => {
        try {
            let account = await Account.contains(msg.from.id, state[msg.from.id][1]);
            let task = await Task.current(msg.from.id, account.login);

            switch (task.type){
                case 'Отписка':
                    send.keyboard(msg.from.id, 'Введите новое количеств отписок в день', ['Назад']);
                    next();
                    break;

                case 'Лайк + Подписка':
                    send.message(msg.from.id, 'В разработке');
                    throw new Error('Пока еще не реализовано');
                    break;

                default:
                    throw new Error('Не верный тип задания!');
                    break;
            }

        } catch (err){
            event.emit('location:back', msg);
        }
    });

    // Обработка редактирования, первый шаг
    event.on('actions:account:update:one', async (msg, action, next) => {
        try {
            let account = await Account.contains(msg.from.id, state[msg.from.id][1]);
            let task = await Task.current(msg.from.id, account.login);

            switch (task.type){
                case 'Отписка':
                    let action = parseInt(msg.text);
                    if (isNaN(action)){
                        send.message(msg.from.id, 'Введите число!');
                        return false;
                    }

                    // Обновляем кол. подписок в день
                    Task.updateActionDayUnFollowing(task._id, msg.text);
                    send.message(msg.from.id, 'Изменения успешно сохранены');

                    event.emit('location:back', msg);
                    break;

                default:
                    throw new Error('Не верный тип задания!');
                    break;
            }

        } catch (err){
            event.emit('location:back', msg);
        }
    });
};