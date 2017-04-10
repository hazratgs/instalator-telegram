const events = require('events');
const event = new events.EventEmitter();
const send = require('./method');
const map = require('./map');

event.on('/start', (msg) => {
    let text = 'Привет ' + msg.from.first_name + ', ' +
        'я instalator - комплекс для автоматизации продвижения аккаунтов instagram. ' +
        'Первое, что необходимо сделать, это добавить аккаунт';

    send.keyboardMap(msg.from.id, text, map);
});

event.on('/home', (msg) => {
    send.keyboardMap(msg.from.id, 'Выберите действие', map);
});

// Экспортируем объект события
module.exports = event;