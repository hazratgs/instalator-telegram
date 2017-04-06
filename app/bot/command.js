const events = require('events');
const event = new events.EventEmitter();
const bot = require('../../libs/telegramBot');

event.on('/start', (msg) => {
    let text = 'Привет ' + msg.from.first_name + ', ' +
        'я instalator - комплекс для автоматизации продвижения аккаунтов instagram. ' +
        'Первое, что необходимо сделать, это добавить аккаунт';

    bot.sendMessage(msg.from.id, text, {
        reply_markup: {
            keyboard: [
                [
                    {
                        text: 'Создать задание'
                    }
                ],
                [
                    {
                        text: 'Активность'
                    }
                ],
                [
                    {
                        text: 'Аккаунты'
                    }
                ]
            ]
        }
    });
});

event.on('/home', (msg) => {
    bot.sendMessage(msg.from.id, 'Выберите действие', {
        reply_markup: {
            keyboard: [
                [
                    {
                        text: 'Создать задание'
                    }
                ],
                [
                    {
                        text: 'Активность'
                    }
                ],
                [
                    {
                        text: 'Аккаунты'
                    }
                ]
            ]
        }
    });
});

// Экспортируем объект события
module.exports = event;