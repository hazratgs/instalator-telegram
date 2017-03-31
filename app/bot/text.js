const bot = require('../../libs/telegramBot');
const constants = require('./constants');

const Account = require('../controllers/account');

/* Создание задания */
exports.createTask = (msg) => {

    /* Выводим список аккаунтов */
    Account.list(msg.from.id, (err, accounts) => {

        if (!accounts.length){

            /* Аккаунтов нет */
            let text = 'У вас нет ни одного аккаунта';
            bot.sendMessage(msg.from.id, text, {
                reply_markup: {
                    keyboard: [
                        [
                            {
                                text: constants.ADD_ACCOUNT
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

        } else {

            /* Отправляем аккаунты на выбор */
            let text = 'Выберите аккаунт';
            let opt = [];

            for (let i in accounts){
                opt.push({
                    text: accounts[i].login
                })
            }

            /* На главную */
            opt.push({
                text: constants.BACK
            });

            bot.sendMessage(msg.from.id, text, {
                reply_markup: {
                    keyboard: [opt],
                    resize_keyboard: true
                }
            });
        }
    });
};

/* Назад */
exports.back = (msg) => {
    bot.sendMessage(msg.from.id, 'Выберите действие', {
        reply_markup: {
            keyboard: [
                [
                    {
                        text: constants.CREATE_TASK
                    }
                ],
                [
                    {
                        text: constants.TASKS
                    }
                ],
                [
                    {
                        text: constants.ACCOUNTS
                    }
                ]
            ],
            resize_keyboard: true
        }
    });
};

/* Добавить аккаунт */
exports.addAccount = (msg, callback) => {
    bot.sendMessage(msg.from.id, 'Введите логин и пароль через пробел', {
        reply_markup: {
            remove_keyboard: true
        }
    });
};

/* Оповещаем об ошибке, не передан параметр */
exports.addAccountErr = (msg) => {
    bot.sendMessage(msg.from.id, 'Не передан логин или пароль, повторите еще раз', {
        reply_markup: {
            remove_keyboard: true
        }
    });
};

/* Сохранение аккаунта */
exports.addAccountSave = (msg, login, password, callback) => {
    Account.add(msg.from.id, login, password, callback);
};

/* Успешно добавили аккаунт */
exports.addAccountSuccess = (msg, login) => {
    bot.sendMessage(msg.from.id, 'Аккаунт ' + login + ' успешно добавлен' , {
        reply_markup: {
            keyboard: [
                [
                    {
                        text: constants.CREATE_TASK
                    }
                ],
                [
                    {
                        text: constants.TASKS
                    }
                ],
                [
                    {
                        text: constants.ACCOUNTS
                    }
                ]
            ]
        }
    });
};