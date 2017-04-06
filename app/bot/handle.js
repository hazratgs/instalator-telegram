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

        // Редьюсер
        const reducer = event.state[msg.from.id].reduce((path, item) => {
            return !path.children ? path : path.children[item]
        }, map);

        // проверяем существование метода
        if (reducer.children.hasOwnProperty(msg.text)){
            let action = reducer.children[msg.text];

            // Вызов действия
            event.event.emit(action.event, msg, action);
        }
    }
};

// Команды bot
exports.command = (msg) => {
    switch (msg.text){

        // Приветствие новых пользователей
        case '/start':
            command.emit('/start', msg);

            //
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