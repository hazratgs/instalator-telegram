const bot = require('../../libs/telegramBot');
const auth = require('./auth');
const handle = require('./handle');

// Обработка telegram событий
bot.on('message', msg => {
    auth({id: msg.from.id, name: msg.from.first_name})
        .then(() => {
            // Авторизован
            if (msg.hasOwnProperty('entities') && msg.entities.type === 'bot_command'){

                // bot команды
                handle.command(msg)
            } else {

                // Текстовые команды
                handle.router(msg)
            }
        })

        // Новый пользователь
        .catch(() => {
            handle.command(msg)
        })
});