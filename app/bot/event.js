const events = require('events');
const event = new events.EventEmitter();
const bot = require('../../libs/telegramBot');
const constants = require('./constants');

const Account = require('../controllers/account');

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
            opt.push({text: accounts[i].login})
        }

        // Добавляем кнопку возврата в главное меню
        opt.push({text: constants.BACK});

        bot.sendMessage(msg.from.id, 'Выберите аккаунт', {
            reply_markup: {
                keyboard: [opt],
                resize_keyboard: true
            }
        });
    });
});

// На главную
event.on('back:home', (msg) => {
    bot.sendMessage(msg.from.id, 'Выберите действие', {
        reply_markup: {
            keyboard: [
                [
                    {
                        text: constants.TASK_CREATE
                    }
                ],
                [
                    {
                        text: constants.TASK_LIST
                    }
                ],
                [
                    {
                        text: constants.ACCOUNT_LIST
                    }
                ]
            ] 
        }
    })
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
            opt.push({text: accounts[i].login})
        }

        // Добавляем кнопку возврата в главное меню
        opt.push({text: constants.BACK});

        bot.sendMessage(msg.from.id, 'Выберите аккаунт', {
            reply_markup: {
                keyboard: [opt],
                resize_keyboard: true
            }
        });
    });
});

// Нет добавленных аккаунтов
event.on('account:empty', (callback) => {
    bot.sendMessage(msg.from.id, 'У вас нет ни одного аккаунта', {
        reply_markup: {
            keyboard: [
                [
                    {
                        text: constants.ACCOUNT_ADD
                    }
                ],
                [
                    {
                        text: constants.BACK
                    }
                ]
            ],
            resize_keyboard: true
        }
    });
});

// Добавить аккаунт
event.on('account:add', (msg) => {
    bot.sendMessage(msg.from.id, 'Введите логин и пароль через пробел', {
        reply_markup: {
            remove_keyboard: true
        }
    })
});

// Ожидание ввода аккаунта
event.on('account:await', (msg, callback) => {
    let account = msg.text.split(' '),
        login = account[0],
        password = account[1];

    account.length != 2

        // Не передан один из параметров
        ? event.emit('account:add:err', msg)

        // Успещно добавлен
        : event.emit('account:add:save', msg, login, password, callback)
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
event.on('account:add:save', (msg, login, password, callback) => {
    Account.add(msg.from.id, login, password, () => {
        bot.sendMessage(msg.from.id, 'Аккаунт ' + login + ' успешно добавлен' , {
            reply_markup: {
                keyboard: [
                    [
                        {
                            text: constants.TASK_CREATE
                        }
                    ],
                    [
                        {
                            text: constants.TASK_LIST
                        }
                    ],
                    [
                        {
                            text: constants.ACCOUNT_LIST
                        }
                    ]
                ]
            }
        });

        if (typeof callback === 'function'){
            callback();
        }
    })
});

// Экспортируем объект события
module.exports = event;