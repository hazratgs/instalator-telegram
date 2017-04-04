const command = require('./command');
const event = require('./event');
const constants = require('./constants');
const location = require('./location');

//  Карта приложения
const tree = {
    event: 'home',
    children: {
        'Создать задание': {
            event: 'task:create',
            children: {
                'febox': {
                    event: 'task:select'
                }
            }
        },
        'Активность': {
            event: '',
            children: {}
        },
        'Аккаунты': {
            event: 'account:list'
        }
    }
};

// Текстовые команды
exports.event = (msg) => {


    if (!location.state.hasOwnProperty(msg.from.id)){
        command.emit('/home', msg);

        if (!location.state.hasOwnProperty(msg.from.id)){
            location.state[msg.from.id] = [];
        }

    } else {

        // Переходим в ветку дерева
        let path = [];
        for (let key in location.state[msg.from.id]){
            path = tree.children[location.state[msg.from.id][key].type]
        }

        console.log(path)
        console.log(location.state)

        // Если ничего нет, вызываем метод по умолчанию
        if (!path.length){
            command.emit('/home', msg);
        } else {

            event.emit(tree.event, msg, tree.event);
        }


        // let path = location.state.reduce((initial, item, index) => {
        //     if (location.state.length === index){
        //         console.log()
        //     }
        // }, {});
    }





    //
    // switch (msg.text){
    //
    //     // Создать задание
    //     case constants.TASK_CREATE:
    //         event.emit('task:create', msg, constants.TASK_CREATE);
    //         break;
    //
    //     // Аккаунты
    //     case constants.ACCOUNT_LIST:
    //         event.emit('account:list', msg, constants.ACCOUNT_LIST);
    //         break;
    //
    //     // Назад
    //     case constants.BACK:
    //         event.emit('back', msg);
    //         break;
    //
    //     // Ввод аккаунта
    //     case constants.ACCOUNT_ADD:
    //         event.emit('account:add', msg, constants.ACCOUNT_ADD);
    //         break;
    //
    //     default:
    //         // Обработка промежуточных состояний
    //         // this.setState(msg);
    //         break;
    // }
    //
    // console.log(location.state);
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

// Управление состоянием
// exports.setState = (msg) => {
//
//     // Поиск состояния пользователя
//     if (state[msg.from.id]){
//
//         switch (state[msg.from.id]){
//
//             // Ожидание ввода аккаунта
//             case constants.ACCOUNT_AWAIT:
//                 event.emit('account:await', () => delete state[msg.from.id]);
//                 break;
//
//             // Выбран аккаунт
//             case constants.ACCOUNT_SELECT:
//                 event.emit('account:select', msg, () => delete state[msg.from.id]);
//                 break;
//
//             default:
//                 break;
//         }
//     }
// };