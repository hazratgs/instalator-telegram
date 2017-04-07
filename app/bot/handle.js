const command = require('./command');
const event = require('./event');
const map = require('./map');

// Редьюсер текстовых команд
exports.router = (msg) => {

    // Нет состояния  у пользователя, отдаем главное меню
    if (!event.state.hasOwnProperty(msg.from.id)){
        command.emit('/home', msg);

        // добавляем пользователя в state
        event.state[msg.from.id] = [];
    } else {

        // Переход в нужную ветку
        const reducer = event.state[msg.from.id].reduce((path, item) => {

            // Если нет дочерних разделов
            if (!path.children){
                return path;
            } else {

                if (path.children.hasOwnProperty(item)){
                    return path.children[item]
                } else {

                    // Если нет подходящей ветки, то пытаемся использовать общую ветку
                    if (path.children.hasOwnProperty('*')){
                        return path.children['*'];
                    } else {
                        return path;
                    }
                }
            }
        }, map);

        // проверяем существование метода
        if (reducer.children.hasOwnProperty(msg.text)){
            let action = reducer.children[msg.text];

            // Вызов действия
            event.event.emit(action.event, msg, action);
        } else {

            // Если нет подходящей ветки, то пытаемся использовать общую ветку
            if (reducer.children.hasOwnProperty('*')){
                let action = reducer.children['*'];

                // Вызов действия
                event.event.emit(action.event, msg, action);
            } else {

                // Обработка методов
                // event.event.emit(reducer.event, msg, reducer);
            }
        }

        setTimeout(() => console.log(event.state[msg.from.id]), 2000)
    }
};

// Команды bot
exports.command = (msg) => {

    // При выполнении bot-команд, необходимо
    // очищать состояние пользователя
    event.state[msg.from.id] = [];

    switch (msg.text){

        // Приветствие новых пользователей
        case '/start':
            command.emit('/start', msg);
            break;

        // Главное меню
        case '/home':
            command.emit('/home', msg);
            break;

        default:
            // Игнорируем остальное
            break;
    }
};