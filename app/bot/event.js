const events = require('events');
const event = new events.EventEmitter();
const send = require('./method');
const map = require('./map');

// Фиксирование расположение пользователя
const state = {};

const Account = require('../controllers/account');

// Изменение расположения пользователя
event.on('location:next', (user, type) => {
    state[user].push(type);
});

// Возврат на один шаг назад
event.on('location:back', (msg) => {

    // Удаляем текущее расположение
    state[msg.from.id].splice(-1,1);

    // Редьюсер
    const reducer = state[msg.from.id].reduce((path, item) => {

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

    // Вызываем событие
    event.emit(reducer.event, msg, reducer);
});

// Главная меню
event.on('home', (msg, action) => {
    send.keyboardMap(msg.from.id, 'Выберите действие', action);
});

// Создание задания
event.on('task:create', (msg) => {
    event.emit('account:list', msg)
});

// Выбор аккаунта для задания
event.on('task:select', (msg) => {
    Account.contains(msg.from.id, msg.text, (accounts) => {
        if (!accounts.length){

            // Запрещаем редактировать состояние
            msg.location = false;

            send.message(msg.from.id, `Аккаунт ${msg.text} не существует, выберите другой`)
        }
    });


});

// Список аккаунтов
event.on('account:list', (msg) => {
    Account.list(msg.from.id, (err, accounts) => {
        if (!accounts.length){
            // Аккаунтов нет, предлогаем добавить
            return event.emit('account:empty', msg);
        }
        let elements = accounts.map((item) => item.login);
        send.keyboardArr(msg.from.id, 'Выберите аккаунт', [...elements, 'Добавить', 'Назад']);
    });
});

// Нет добавленных аккаунтов
event.on('account:empty', (msg) => {
    send.keyboardArr(msg.from.id, 'У вас нет ни одного аккаунта', ['Добавить', 'Назад'])
});

// Добавить аккаунт
event.on('account:add', (msg) => {
    send.keyboardArr(msg.from.id, 'Введите логин и пароль через пробел', ['Назад'])
});

// Ожидание ввода аккаунта
event.on('account:await', (msg) => {
    let account = msg.text.split(' '),
        login = account[0],
        password = account[1];

    account.length != 2

        // Не передан один из параметров
        ? event.emit('account:add:err', msg)

        // Успещно добавлен
        : event.emit('account:add:save', msg, login, password);
});

// Ошибка добавления аккаунта, не передан логин/пароль
event.on('account:add:err', (msg) => {
    send.keyboardArr(msg.from.id, 'Не передан пароль', ['Назад'])
});

// Сохранение аккаунта
event.on('account:add:save', (msg, login, password) => {
    Account.add(msg.from.id, login, password, () => {
        send.message(msg.from.id, 'Аккаунт ' + login + ' успешно добавлен');
        event.emit('location:back', msg);
    });
});

// Выбор аккаунта
event.on('account:select', (msg, action) => {
    Account.contains(msg.from.id, msg.text, (accounts) => {
        !accounts.length
            ? send.message(msg.from.id, `Аккаунт ${msg.text} не существует, выберите другой`)
            : send.keyboardMap(msg.from.id, 'Выберите действия для ' + msg.text, action)
    });
});

// Удаление аккаунты
event.on('account:delete', (msg) => {
    let login = state[msg.from.id][state[msg.from.id].length - 1];

    // Проверяем существование аккаунта
    Account.contains(msg.from.id, login, (accounts) => {

        // Обработка ошибки
        if (!accounts.length){
            send.message(msg.from.id, 'Аккаунт не найден!');

            // Шаг назад
            return event.emit('location.back', msg);
        }

        // Удаление
        Account.remove(msg.from.id, login, () => {
            send.message(msg.from.id, `Аккаунт ${login} удален`);

            // Шаг назад
            event.emit('location:back', msg);
        })
    })
});

event.on('account:contains', (user, account) => {

});

// Экспортируем объект события
exports.event = event;
exports.state = state;
