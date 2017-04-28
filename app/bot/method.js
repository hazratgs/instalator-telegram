const bot = require('../../libs/telegramBot');
const emoji = require('./emoji');

// Отправки сообщения
exports.message = (user, message) => {
    bot.sendMessage(user, message);
};

// Отправка Сообщения с клавиатурой
exports.keyboard = (user, message, data, inline = 2) => {
    let opt = [],
        arr = [],
        i = 0;

    // Если поступил объект map, берем данные из текущей ветки
    if (!Array.isArray(data)){
        for (let item in data.children){
            arr.push(item)
        }
    } else {

        // Поступил обычный массив
        arr = data;
    }

    for (let key of arr){

        // Если inline больше 1, то вставляем inline элеменов в одну строку
        if (i < inline && opt[opt.length - 1] !== undefined){
            opt[opt.length - 1].push({
                text: emoji.encode(key)
            });
        } else {
            if (i === inline) i = 0;

            opt.push([{
                text: emoji.encode(key)
            }]);
        }

        i++
    }

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
};

// Отправка изображений
exports.image = () => {}