const command = require('./command');
const text = require('./text');
const constants = require('./constants');


/* Эдакий промежуточное состояние */
const middlewareState = {};

/* Роутер callback */
exports.text = (msg) => {
    switch (msg.text){

        /* Создать задание */
        case constants.CREATE_TASK:
            text.createTask(msg);
            break;

        /* Назад  */
        case constants.BACK:
            text.back(msg);
            break;

        /* Ввод аккаунта  */
        case constants.ADD_ACCOUNT:
            text.addAccount(msg);

            /* Сохраняем промежуточное состояние пользователя */
            middlewareState[msg.from.id] = constants.AWAIT_ACCOUNT;
            break;

        default:

            /* Обработка промежуточных состояний, текстовых */
            this.state(msg);
            break;
    }
};

/* Роутер команд */
exports.command = (msg) => {
    switch (msg.text){
        case '/start':
            command.start(msg);
            break;
        default:
            command.start(msg);
            break;
    }
};

/* Роутер действий */
exports.callback = (callbackQuery) => {

};

/* Роутер состояния */
exports.state = (msg) => {

    /* Поиск состояния пользователя */
    if (middlewareState[msg.from.id]){

        switch (middlewareState[msg.from.id]){
            case constants.AWAIT_ACCOUNT:
                let account = msg.text.split(' '),
                    login = account[0],
                    password = account[1];

                /* Не передан один из параметров */
                if (account.length != 2){
                    text.addAccountErr(msg)
                } else {
                    text.addAccountSave(msg, login, password, (err, AddAccount) => {
                        text.addAccountSuccess(msg, login)
                    });
                }
                break;
        }
    }
};