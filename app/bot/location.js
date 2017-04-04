const events = require('events');
const event = new events.EventEmitter();
const botEvents = require('./event');

// Фиксирование расположение пользователя
const state = {};

// Изменение расположения пользователя
event.on('location:next', (user, type) => {
    if (!state.hasOwnProperty(user)){
        state[user] = [];
    }

    // Добавляем новый путь
    state[user].push({
        type: type
    });
});

// Возврат на один шаг назад
event.on('location:back', (user) => {

    // Удаляем текущее расположение
    console.log(state);
    state[user].splice(-1,1);

    console.log(state);

    // Возвращаемся на один уровень выше
    let back = state[user][state[user].length - 1];

    // Вызываем событие
    botEvents.emit(back.type);
});



exports.state = state;
exports.event = event;


