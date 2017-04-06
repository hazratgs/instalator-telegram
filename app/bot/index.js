const bot = require('../../libs/telegramBot');
const auth = require('./auth');
const handle = require('./handle');

// Обработка telegram событий
bot.on('message', (msg) => {
    auth({
        id: msg.from.id,
        name: msg.from.first_name
    }, (registered) => {

        if (registered){

            // Авторизован
            msg.hasOwnProperty('entities') ?
                handle.command(msg) :
                handle.router(msg)

        } else {

            // Новый пользователь
            handle.command(msg)
        }
    });
});