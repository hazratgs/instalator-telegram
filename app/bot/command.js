const bot = require('../../libs/telegramBot');
const constants = require('./constants');

/* Команда /start */
exports.start = (msg) => {
    let text = 'Привет ' + msg.from.first_name + ', я instalator - комплекс для автоматизации продвижения аккаунтов instagram. Первое, что необходимо сделать, это добавить аккаунт';
    bot.sendMessage(msg.from.id, text, {
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
}