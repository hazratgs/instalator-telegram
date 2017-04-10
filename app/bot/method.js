const bot = require('../../libs/telegramBot');

// Отправки сообщения
exports.message = (user, message) => {
    bot.sendMessage(user, message);
};

// Отправка Сообщения с клавиатурой
exports.keyboard = (user, message, keyboards) => {
    bot.sendMessage(user, message, {
        reply_markup: {
            keyboard: keyboards,
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
};

// Отправка Сообщения с клавиатурой, данные клавиатуры из ветки (obj)
exports.keyboardMap = (user, message, action) => {
    let opt = [];

    // Данные берем из текущей ветки "map"
    for (let key in action.children){
        opt.push([{
            text: key
        }])
    }

    bot.sendMessage(user, message, {
        reply_markup: {
            keyboard: opt,
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
};

// Отправка Сообщения с клавиатурой, данные клавиатуры из массива
exports.keyboardArr = (user, message, arr) => {
    let opt = arr.map((item) => {
        return [{
            text: item
        }]
    });

    bot.sendMessage(user, message, {
        reply_markup: {
            keyboard: opt,
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
};

// Отправить сообщение с скрытием клавиатуры
exports.messageHiddenKeyboard = (user, message) => {
    bot.sendMessage(user, message, {
        reply_markup: {
            remove_keyboard: true
        }
    });
}

// Отправка изображений
exports.image = () => {}