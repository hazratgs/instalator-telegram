const Account = require('../../controllers/account');
const Source = require('../../controllers/source');
const Task = require('../../controllers/task');
const instanode = require('../../../bin/instanode');

module.exports = (event, state, log, map, send) => {

    // Создание задания
    event.on('task:create', (msg, action, next) => {
        event.emit('account:list', msg);
        next ? next() : null
    });

    // Выбор аккаунта для задания
    event.on('task:select', (msg, action, next) => {
        Account.contains(msg.from.id, msg.text)
            .then(account => {

                // Проверяем, есть ли активные задания у аккаунта
                Task.current(msg.from.id, msg.text)

                // Активное задание есть
                    .then(tasks => {
                        send.message(msg.from.id, `Есть активное задание у ${msg.text}, попробуйте позже.`);
                        event.emit('account:list', msg);
                    })
                    .catch(err => {
                        send.keyboard(msg.from.id, `Выберите действие`, action);
                        next ? next() : null
                    })
            })
            .catch(err => {
                send.message(msg.from.id, `Аккаунт ${msg.text} не существует, выберите другой`);
            });
    });

    // Выбор типа задания
    event.on('task:select:type', (msg, action, next) => {
        switch (msg.text){
            case 'Лайк + Подписка':
                event.emit('task:select:follow+like', msg, action);
                break;

            case 'Отписка':
                send.keyboard(msg.from.id, `Сколько отписок в день совершать?`, ['50', '150', '300', '500', 'Назад'], 4);
                next ? next() : null;
                break;

            default:
                send.message(msg.from.id, `Ошибка, выберите действие`);
                return null;
                break;
        }
    });

    // Выбор типа источника
    event.on('task:select:follow+like', (msg, action, next) => {
        send.keyboard(msg.from.id, `Выберите тип источника`, action);
        next ? next() : null
    });

    // Пользователь
    event.on('task:select:follow+like:user', (msg, action, next) => {
        send.keyboard(msg.from.id, `В разработке, выберите другой тип источника`, action);
        next ? next() : null;
        event.emit('location:back', msg);
    });

    // Локация
    event.on('task:select:follow+like:geo', (msg, action, next) => {
        send.keyboard(msg.from.id, `В разработке, выберите другой тип источника`, action);
        next ? next() : null;
        event.emit('location:back', msg);
    });

    // Хештег
    event.on('task:select:follow+like:hashtag', (msg, action, next) => {
        send.keyboard(msg.from.id, `В разработке, выберите другой тип источника`, action);
        next ? next() : null;
        event.emit('location:back', msg);
    });

    // Список источников
    event.on('task:select:follow+like:source', (msg, action, next) => {
        Source.list()
            .then(result => {
                let source = result.map((item) => {
                    return item.name
                });

                // Выбранное действие
                send.keyboard(msg.from.id, `Выберите источник`, [...source, 'Назад']);
                next ? next() : null;
            })
            .catch(err => {
                next ? next() : null;

                send.message(msg.from.id, 'К сожалению нет источников');
                event.emit('location:back', msg);
            });
    });

    // Выбор источника
    event.on('task:select:follow+like:source:select', (msg, action, next) => {
        Source.contains(msg.text)
            .then(source => {
                // Кол. действия
                send.keyboard(msg.from.id, 'Введите количество Подписок', ['2500', '5000', '7500', 'Назад']);
                next ? next() : null
            })
            .catch(err => {
                send.message(msg.from.id, 'Ошибка, нет такого источника');
            })
    });

    // Количество действий
    event.on('task:select:follow+like:source:action', (msg, action, next) => {
        let length = parseInt(msg.text);
        if (isNaN(length) || length > 7500){
            send.message(msg.from.id, 'Не более 7500 подписчиков в одном задании');
            return null;
        }

        // Просим ввести кол. лайков к профилю
        send.keyboard(msg.from.id, 'К скольким в день подписываться?', ['300', '500', '750', '1000', 'Назад']);
        next ? next() : null
    });

    // Количество действий в день
    event.on('task:select:follow+like:source:actionPerDay', (msg, action, next) => {
        let length = parseInt(msg.text);
        if (isNaN(length) || length > 1200){
            send.message(msg.from.id, 'Слишком много, могут заблокировать. Попробуй еще раз...');
            return null;
        }

        // Просим ввести кол. лайков к профилю
        send.keyboard(msg.from.id, 'Сколько лайков ставить?', ['1', '2', '3', '4', '5', 'Назад']);
        next ? next() : null
    });

    // Количество лайков к фотографии
    event.on('task:select:follow+like:source:like', (msg, action, next) => {
        let length = parseInt(msg.text);
        if (isNaN(length) || length > 5){
            send.message(msg.from.id, 'Думаю это слишко много...');
            return null;
        }
        next();

        // Сохранение задания
        event.emit('task:create:follow+like:save', msg, action);
    });

    // Создаем задание
    event.on('task:create:follow+like:save', (msg, action) => {
        let data = state[msg.from.id];
        data.splice(0, 1);

        // Проверка существования задачи
        Task.current(msg.from.id, data[0])
            .then(task => {
                send.message(msg.from.id, 'У этого аккаунта есть активное задание, дождитесь завершения.');

                // Переходим на главную
                event.emit('location:home', msg);
            })
            .catch(err => {
                Task.createFollowLike({
                    user: msg.from.id,
                    login: data[0],
                    type: data[1],
                    sourceType: data[2],
                    source: data[3],
                    action: data[4],
                    actionDay: data[5],
                    like: data[6],
                })
                    .then(() => {
                        send.message(msg.from.id, 'Задание успешно добавлено, подробнее можете посмотреть в активности');

                        // Переходим на главную
                        event.emit('location:home', msg);
                    })
                    .catch((err) => {
                        send.message(msg.from.id, 'Возникла ошибка, пожалуйста повторите еще раз!');

                        // Переходим на главную
                        event.emit('location:home', msg);
                    })
            })
    });

    // Отписка
    event.on('task:select:type:unfollow', (msg, action, next) => {
        let length = parseInt(msg.text);
        if (isNaN(length) || length > 1200){
            send.message(msg.from.id, 'Не более 1200 отписок в одном задании');
            return null;
        }
        next();

        event.emit('task:select:type:unfollow:save', msg, action)
    });

    // Создание задание отписка
    event.on('task:select:type:unfollow:save', (msg, action) => {
        let data = state[msg.from.id];
        data.splice(0, 1);

        // Проверка существования задачи
        Task.current(msg.from.id, data[0])
            .then(task => {
                send.message(msg.from.id, 'У этого аккаунта есть активное задание, дождитесь завершения.');

                // Переходим на главную
                event.emit('location:home', msg);
            })
            .catch(err => {
                Task.createUnFollow({
                    user: msg.from.id,
                    login: data[0],
                    type: data[1],
                    actionFollowingDay: data[2]
                })
                    .then(() => {
                        send.message(msg.from.id, 'Задание успешно добавлено, подробнее можете посмотреть в активности');

                        // Переходим на главную
                        event.emit('location:home', msg);
                    })
                    .catch((err) => {
                        send.message(msg.from.id, 'Возникла ошибка, пожалуйста повторите еще раз!');

                        // Переходим на главную
                        event.emit('location:home', msg);
                    })
            })
    });
};

