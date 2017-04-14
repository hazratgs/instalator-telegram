const events = require('events');
const event = new events.EventEmitter();
const send = require('./method');
const map = require('./map');
const instanode = require('./instanode');

// Фиксирование расположение пользователя
const state = {};

const Account = require('../controllers/account');
const Source = require('../controllers/source');

// Изменение расположения пользователя
event.on('location:next', (msg, action) => {
    if (action.event != 'location:back' && !action.await){
        state[msg.from.id].push(msg.text);
    }
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

// Перейти на главную
event.on('location:home', (msg) => {
    state[msg.from.id] = [];
    event.emit('location:back', msg);
});

// Главная меню
event.on('home', (msg, action, next) => {
    send.keyboardMap(msg.from.id, 'Выберите действие', action);
    next ? next() : null
});

// Создание задания
event.on('task:create', (msg, action, next) => {
    event.emit('account:list', msg);
    next ? next() : null
});

// Выбор аккаунта для задания
event.on('task:select', (msg, action, next) => {
    Account.contains(msg.from.id, msg.text, (accounts) => {
        if (!accounts.length){
            send.message(msg.from.id, `Аккаунт ${msg.text} не существует, выберите другой`);
            return null;
        }

        send.keyboardMap(msg.from.id, `Выберите действие`, action);
        next ? next() : null
    });
});

// Выбор типа задания
event.on('task:select:type', (msg, action, next) => {
    let types = ['Лайк + Подписка', 'Лайк', 'Подписка', 'Отписка'];
    if (!types.includes(msg.text)){
        send.message(msg.from.id, `Ошибка, выберите действие`);
        return null;
    }

    // Выбранное действие
    send.keyboardArr(msg.from.id, `Выберите источник`, Source.list());
    next ? next() : null
});

// Список источников
event.on('task:select:source', (msg, action, next) => {
    if (!Source.list().includes(msg.text)){
        send.message(msg.from.id, 'Ошибка, неверный источник');
        return null;
    }

    // Кол. действия
    send.keyboardArr(msg.from.id, 'Введите количество действий', ['2500', '5000', '7500']);
    next ? next() : null
});

// Количество действий
event.on('task:select:action', (msg, action, next) => {
    send.message(msg.from.id, 'Добавлено в задание!');

    // Переходим на главную
    event.emit('location:home', msg);
});

// Список аккаунтов
event.on('account:list', (msg, action, next) => {
    Account.list(msg.from.id, (err, accounts) => {
        if (!accounts.length){

            // Аккаунтов нет, предлогаем добавить
            return event.emit('account:empty', msg);
        }

        let elements = accounts.map((item) => item.login);
        send.keyboardArr(msg.from.id, 'Выберите аккаунт', [...elements, 'Добавить', 'Назад']);
    });
    next ? next() : null
});

// Нет добавленных аккаунтов
event.on('account:empty', (msg, action, next) => {
    send.keyboardArr(msg.from.id, 'У вас нет ни одного аккаунта', ['Добавить', 'Назад'])
});

// Добавить аккаунт
event.on('account:add', (msg, action, next) => {
    send.keyboardArr(msg.from.id, 'Введите логин и пароль через пробел', ['Назад']);
    next ? next() : null
});

// Ожидание ввода аккаунта
event.on('account:await', (msg, action, next) => {
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
event.on('account:add:err', (msg, action, next) => {
    send.keyboardArr(msg.from.id, 'Не передан пароль', ['Назад'])
});

// Сохранение аккаунта
event.on('account:add:save', (msg, login, password) => {

    // Проверяем, есть ли аккаунт у других пользователей
    Account.containsAllUsers(login, (result) => {
        if (result.length){
            send.message(msg.from.id, `${login} уже используется!`);
            return null;
        }

        send.message(msg.from.id, `Подождите немного, пытаюсь авторизоваться`);

        // Входим в аккаунт
        instanode.auth(login, password, (error, stdout, stderr) => {

            // Логин пароль не верны
            if (stdout.trim() != 'success'){
                send.message(msg.from.id, stdout.trim());
                return null;
            }

            // Сохраняем
            Account.add(msg.from.id, login, password, () => {
                send.message(msg.from.id, `Аккаунт ${login} успешно добавлен, войдите в Instagram и подтвердите, что это были вы`);
                event.emit('location:back', msg);
            });
        });
    });
});

// Выбор аккаунта
event.on('account:select', (msg, action, next) => {
    Account.contains(msg.from.id, msg.text, (accounts) => {
        if (!accounts.length){
            return send.message(msg.from.id, `Аккаунт ${msg.text} не существует, выберите другой`);
        }

        send.keyboardMap(msg.from.id, 'Выберите действия для ' + msg.text, action)
        next ? next() : null
    });
});

// Удаление аккаунты
event.on('account:delete', (msg) => {
    let login = state[msg.from.id][state[msg.from.id].length - 1];

    // Проверяем существование аккаунта
    Account.contains(msg.from.id, login, (accounts) => {
        if (!accounts.length){
            send.message(msg.from.id, 'Аккаунт не найден!');
            event.emit('location.back', msg);
            return null;
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

//
// event.on('instanode:')


// Экспортируем объект события
exports.event = event;
exports.state = state;
