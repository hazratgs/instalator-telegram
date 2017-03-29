const bot = require(process.cwd() + '/libs/telegramBot');
const auth = require('./auth');
const routes = require('./routes');

/* Models */
const User = require(process.cwd() + '/app/controllers/user');
const Account = require(process.cwd() + '/app/controllers/account');

/* Обработка сообщений */
bot.onText(/(.+)$/, function (msg, match) {
    const id = msg.from.id;

    /* Авторизация */
    auth({
        id: msg.from.id,
        name: msg.from.first_name
    }, (user) => {

        bot.sendMessage(msg.from.id, 'Приветствую ' + user[0].name + ', у вас 2 аккаунта, активных заданий 0');

        /* Отправляем кнопки */
        bot.sendMessage(msg.from.id, 'Выберите действие', {
            reply_markup: {
                keyboard: [
                    [
                        {
                            text: 'Добавить аккаунт'
                        }
                    ],
                    [
                        {
                            text: 'Список аккаунтов'
                        }
                    ],
                    [
                        {
                            text: 'Создать задания'
                        }
                    ]
                ]
            }
        });

        /* Получаем список аккаунтов пользователя */
        // Account.list(id, (err, accounts) => {
        //     if (accounts.length){
        //
        //         /* Есть зарегистрированные аккаунты */
        //
        //     } else {
        //
        //     }
        // });


    });
});