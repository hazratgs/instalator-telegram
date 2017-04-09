const bot = require('../../libs/telegramBot');

// Отправки сообщения
exports.message = (user, message) => {
    bot.sendMessage(user, message);
};

// Отправка Сообщения с клавиатурой
exports.keyboard = (user, message, keyboards) => {
    bot.sendMessage(user, message, {
        reply_markup: {
            keyboard: keyboards
        }
    });
};

// Отправка изображений
exports.image = () => {}