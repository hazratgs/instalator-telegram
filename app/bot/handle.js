const command = require('./command');
const event = require('./event');
const constants = require('./constants');

// Cостояние
const state = {};

// Текстовые команды
exports.event = (msg) => {
    switch (msg.text){

        // Создать задание
        case constants.TASK_CREATE:
            event.emit('task:create', msg);
            break;

        // Аккаунты
        case constants.ACCOUNT_LIST:
            event.emit('account:list', msg);
            break;

        // Назад
        case constants.BACK:
            event.emit('back:home', msg);
            break;

        // Ввод аккаунта
        case constants.ACCOUNT_ADD:
            event.emit('account:add', msg);

            // Сохраняем промежуточное состояние пользователя
            state[msg.from.id] = constants.ACCOUNT_AWAIT;
            break;

        default:

            // Обработка промежуточных состояний
            this.setState(msg);
            break;
    }
};

// Команды bot
exports.command = (msg) => {
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

// Управление состоянием
exports.setState = (msg) => {

    // Поиск состояния пользователя
    if (state[msg.from.id]){

        switch (state[msg.from.id]){

            // Ожидание ввода аккаунта
            case constants.ACCOUNT_AWAIT:
                event.emit('account:await', () => delete state[msg.from.id]);
                break;

            default:
                break;
        }
    }
};