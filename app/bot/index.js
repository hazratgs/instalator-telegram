const bot = require(process.cwd() + '/libs/telegramBot');
const auth = require('./auth');
const routes = require('./routes');
const command = require('./command');

/* Models */
const User = require(process.cwd() + '/app/controllers/user');
const Account = require(process.cwd() + '/app/controllers/account');

// User.cleaner();

/* Обработка сообщений */
bot.onText(/(.+)$/, function (msg, match) {
    const id = msg.from.id;

    /* Авторизация */
    auth({
        id: msg.from.id,
        name: msg.from.first_name
    }, (user, first) => {

        /* Пользователь только зарегистрировался */
        if (first){

            /* Отправляем приветствие */
            command.start(msg);

        } else {

            /* Обработка Bot комманд */
            if (typeof msg.entities == 'object'){
                routes.command(msg);

            } else {

                /* Обработка текстовых комманд */
                routes.text(msg);
            }
        }
    });
});


/* Действия */
bot.on("callback_query", function(callbackQuery) {

    /* Роутер действий */
    routes.callback(callbackQuery);

    // const id = callbackQuery.from.id;
    //
    // /* Авторизация */
    // auth({
    //     id: callbackQuery.from.id,
    //     name: callbackQuery.from.first_name
    // }, () => {
    //     console.log(callbackQuery)
    //
    //     /* Реакция */
    //     bot.answerCallbackQuery(callbackQuery.id, 'Введите логин аккаунта', true);
    //     // routes(callbackQuery);
    // });
});


