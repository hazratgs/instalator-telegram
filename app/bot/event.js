const events = require('events');
const event = new events.EventEmitter();
const send = require('./method');
const map = require('./map');
const instanode = require('../../bin/instanode');

// Фиксирование расположение пользователя
const state = {};

const Account = require('../controllers/account');
const Source = require('../controllers/source');
const Task = require('../controllers/task');

// Изменение расположения пользователя
event.on('location:next', (msg, action) => {
    if (action.event !== 'location:back' && !action.await){
        state[msg.from.id].push(msg.text);
    }
});

// Возврат на один шаг назад
event.on('location:back', (msg) => {

    // Удаляем текущее расположение
    state[msg.from.id].splice(-1,1);

    // Редьюсер
    const reducer = state[msg.from.id].reduce((path, item) => {

        // Используем значение из состояния для общей ветки,
        // что бы не было такого, например возврат из общей ветки в общую
        // приводил бы к выбору, например пользователя с ником Назад
        // пр этой причине, подставляем текст, так как событие Назад уже отработало
        msg.text = item;

        // Если нет дочерних разделов
        if (!path.children){
            return path;
        } else {
            if (path.children.hasOwnProperty(item)){
                return path.children[item]
            } else {

                // Если нет подходящей ветки, то пытаемся использовать общую ветку
                if (path.children.hasOwnProperty('*')){
                    return path.children['*'];
                } else {
                    return path;
                }
            }
        }
    }, map);

    // Вызываем событие
    event.emit(reducer.event, msg, reducer);
});

// Перейти на главную
event.on('location:home', (msg) => {
    state[msg.from.id] = [];
    event.emit('location:back', msg);
});

// Главная меню
event.on('home', (msg, action, next) => {
    send.keyboard(msg.from.id, 'Выберите действие', action, 2);
    next ? next() : null
});

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

// Список аккаунтов
event.on('account:list', (msg, action, next) => {
    Account.list(msg.from.id)
        .then(accounts => {
            let elements = accounts.map((item) => item.login);
            send.keyboard(msg.from.id, 'Выберите аккаунт', [...elements, 'Добавить аккаунт', 'Назад']);
            next ? next() : null
        })

        // Аккаунтов нет, предлогаем добавить
        .catch(err => {
            event.emit('account:empty', msg)
            next ? next() : null
        })
});

// Нет добавленных аккаунтов
event.on('account:empty', (msg, action, next) => {
    send.keyboard(msg.from.id, 'У вас нет ни одного аккаунта', ['Добавить аккаунт', 'Назад'])

});

// Добавить аккаунт
event.on('account:add', (msg, action, next) => {
    send.keyboard(msg.from.id, 'Введите логин и пароль через пробел', ['Назад']);
    next ? next() : null
});

// Ожидание ввода аккаунта
event.on('account:await', (msg, action, next) => {
    let account = msg.text.split(' '),
        login = account[0],
        password = account[1];

    account.length !== 2

        // Не передан один из параметров
        ? event.emit('account:add:err', msg)

        // Успещно добавлен
        : event.emit('account:add:save', msg, login, password);
});

// Ошибка добавления аккаунта, не передан логин/пароль
event.on('account:add:err', (msg, action, next) => {
    send.keyboard(msg.from.id, 'Не передан пароль', ['Назад'])
});

// Сохранение аккаунта
event.on('account:add:save', (msg, login, password) => {

    // Проверяем, есть ли аккаунт у других пользователей
    Account.containsAllUsers(login)
        .then(result => {
            send.message(msg.from.id, `${login} уже используется!`);
        })
        .catch(err => {
            send.message(msg.from.id, `Подождите немного, пытаюсь авторизоваться`);

            // Входим в аккаунт
            instanode.auth(login, password)
                .then(async (session) => {

                    // Сохраняем
                    Account.add(msg.from.id, login, password)
                        .then(() => {
                            send.message(msg.from.id, `Аккаунт ${login} успешно добавлен, войдите в Instagram и подтвердите, что это были вы`);
                            event.emit('location:home', msg);
                        })
                        .catch(err => {
                            send.message(msg.from.id, 'Возникла ошибка при авторизации, проверьте правильность логина/пароля');
                        });
                })
                .catch((err) => {
                    send.message(msg.from.id, 'Возникла ошибка при авторизации, проверьте правильность логина/пароля');
                })
        })
});

// Выбор аккаунта
event.on('account:select', (msg, action, next) => {
    Account.contains(msg.from.id, msg.text)
        .then(account => {
            send.keyboard(msg.from.id, 'Выберите действия для ' + msg.text, action);
            next ? next() : null
        })
        .catch(err => send.message(msg.from.id, `Аккаунт ${msg.text} не существует, выберите другой`))
});

// Удаление аккаунты
event.on('account:delete', (msg) => {
    let login = state[msg.from.id][state[msg.from.id].length - 1];

    // Проверяем существование аккаунта
    Account.contains(msg.from.id, login)
        .then(() => {

            // Удаление
            Account.remove(msg.from.id, login)
                .catch(err => {
                    send.message(msg.from.id, `Возникла ошибка, пожалуйста повторите позже.`);
                    event.emit('location:back', msg);
                })
                .then(() => {
                    send.message(msg.from.id, `Аккаунт ${login} удален`);
                    event.emit('location:back', msg);
                });
        })
        .catch(err => {
            send.message(msg.from.id, 'Аккаунт не найден!');
            event.emit('location.back', msg);
        })
});

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
                daily = Math.round(task.params.actionFollow / task.params.actionFollowDay);
                text = `Активность ${task.login}\nТип задачи: ${task.type}\nСостояние: ${task.params.actionFollow}/${task.params.following.length}\nПодписок в день: ${task.params.actionFollowDay}\nЛайков в день: ${task.params.actionLikeDay}\nИсточник: ${task.params.source}\nДата завершения: ${daily} дней`;
                break;

            case 'Отписка':
                daily = Math.round((task.params.following - task.params.unFollowing) / task.params.actionFollowingDay);
                text = `Активность ${task.login}\nТип задачи: ${task.type}\nСостояние: ${task.params.following}/${task.params.unFollowing}\nОтписок в день: ${task.params.actionFollowingDay}\nДата завершения: ${daily} дней`;
                break;

            default:
                break
        }

        send.keyboard(msg.from.id, text, ['Отменить', 'Назад']);
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

// Экспортируем объект события
exports.event = event;
exports.state = state;
