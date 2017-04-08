const events = require('events');
const event = new events.EventEmitter();
const bot = require('../../libs/telegramBot');
const map = require('./map');

// Фиксирование расположение пользователя
const state = {};

const Account = require('../controllers/account');

// Изменение расположения пользователя
event.on('location:next', (user, type) => {
    if (type == 'Назад') return false;

    // Добавляем новый путь
    state[user].push(type);
});

// Возврат на один шаг назад
event.on('location:back', (msg) => {

    // Удаляем текущее расположение
    state[msg.from.id].splice(-1,1);

    // Редьюсер
    const reducer = state[msg.from.id].reduce((path, item) => {

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

// Главная меню
event.on('home', (msg, action) => {
    let keyboard = [];
    for (let key in action.children){
        keyboard.push([{
            text: key
        }])
    }

    bot.sendMessage(msg.from.id, 'Выберите действие', {
        reply_markup: {
            keyboard: keyboard
        }
    });
});

// Создание задания
event.on('task:create', (msg) => {
    Account.list(msg.from.id, (err, accounts) => {

        // Аккаунтов нет, предлогаем добавить
        if (!accounts.length){
            return event.on('account:empty');
        }

        // Отправляем аккаунты на выбор
        let opt = [];
        for (let i in accounts){
            opt.push([{
                text: accounts[i].login
            }])
        }

        // Добавляем кнопку возврата в главное меню
        opt.push([{
            text: 'Назад'
        }]);

        bot.sendMessage(msg.from.id, 'Выберите аккаунт', {
            reply_markup: {
                keyboard: opt
            }
        });
    });
    // event.emit('location:next', msg.from.id, 'Создать задание');
});

// Список аккаунтов
event.on('account:list', (msg) => {
    Account.list(msg.from.id, (err, accounts) => {

        // Аккаунтов нет, предлогаем добавить
        if (!accounts.length){
            return event.on('account:empty');
        }

        // Отправляем аккаунты на выбор
        let opt = [];

        for (let i in accounts){
            opt.push([{
                text: accounts[i].login
            }])
        }

        // Добавить аккаунт
        opt.push([{
            text: 'Добавить'
        }]);

        // Кнопка назад
        opt.push([{
            text: 'Назад'
        }]);

        bot.sendMessage(msg.from.id, 'Выберите аккаунт', {
            reply_markup: {
                keyboard: opt
            }
        });

        // event.emit('location:next', msg.from.id, 'Аккаунты');
    });
});

// Нет добавленных аккаунтов
event.on('account:empty', (msg) => {
    bot.sendMessage(msg.from.id, 'У вас нет ни одного аккаунта', {
        reply_markup: {
            keyboard: [
                [
                    {
                        text: 'Добавить'
                    }
                ],
                [
                    {
                        text: 'Назад'
                    }
                ]
            ]
        }
    });
    // event.emit('location:next', msg.from.id, msg.text);
});

// Добавить аккаунт
event.on('account:add', (msg) => {
    bot.sendMessage(msg.from.id, 'Введите логин и пароль через пробел', {
        reply_markup: {
            remove_keyboard: true
        }
    });
    // event.emit('location:next', msg.from.id, 'Добавить');
});

// Ожидание ввода аккаунта
event.on('account:await', (msg) => {
    let account = msg.text.split(' '),
        login = account[0],
        password = account[1];

    account.length != 2

        // Не передан один из параметров
        ? event.emit('account:add:err', msg)

        // Успещно добавлен
        : event.emit('account:add:save', msg, login, password);
});

// Ошибка добавления аккаунта, не передан логин/пароль
event.on('account:add:err', (msg) => {
    bot.sendMessage(msg.from.id, 'Не передан логин или пароль, повторите еще раз', {
        reply_markup: {
            remove_keyboard: true
        }
    });
});

// Сохранение аккаунта
event.on('account:add:save', (msg, login, password) => {
    Account.add(msg.from.id, login, password, () => {
        bot.sendMessage(msg.from.id, 'Аккаунт ' + login + ' успешно добавлен');
        event.emit('location:back', msg);
    });
});

// Выбор аккаунта
event.on('account:select', (msg) => {
    bot.sendMessage(msg.from.id, 'Выберите действия для ' + msg.text, {
        reply_markup: {
            keyboard: [
                [
                    {
                        text: 'Добавить задание'
                    }
                ],
                [
                    {
                        text: 'Активность'
                    }
                ],
                [
                    {
                        text: 'Редактировать'
                    }
                ],
                [
                    {
                        text: 'Удалить'
                    }
                ],
                [
                    {
                        text: 'Назад'
                    }
                ]
            ]
        }
    });
    // event.emit('location:next', msg.from.id, msg.text);
});

// event.on('account:contains', (user, account) => {
//
// });

// Экспортируем объект события
exports.event = event;
exports.state = state;
