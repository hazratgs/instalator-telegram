const events = require('events')
const event = new events.EventEmitter()
const send = require('./../method')
const map = require('./../map')

// Фиксирование расположение пользователя
const state = {}

// Основные компоненты
const account = require('./account')(event, state, map, send)
const action = require('./action')(event, state, map, send)
const task = require('./task')(event, state, map, send)
// const publication = require('./publication')(event, state, map, send)

// Изменение расположения пользователя
event.on('location:next', (msg, action, value) => {
  if (action.event !== 'location:back' && !action.await) {
    state[msg.from.id].push(value)
  }
})

// Возврат на один шаг назад
event.on('location:back', msg => {
  // Удаляем текущее расположение
  state[msg.from.id].splice(-1, 1)

  // Редьюсер
  const reducer = state[msg.from.id].reduce((path, item) => {
    // Используем значение из состояния для общей ветки,
    // что бы не было такого, например возврат из общей ветки в общую
    // приводил бы к выбору, например пользователя с ником Назад
    // пр этой причине, подставляем текст, так как событие Назад уже отработало
    msg.text = item

    // Если нет дочерних разделов
    if (!path.children) {
      return path
    } else {
      if (path.children.hasOwnProperty(item)) {
        return path.children[item]
      } else {
        // Если нет подходящей ветки, то пытаемся использовать общую ветку
        if (path.children.hasOwnProperty('*')) {
          return path.children['*']
        } else {
          return path
        }
      }
    }
  }, map)

  // Вызываем событие
  event.emit(reducer.event, msg, reducer)
})

// Перейти на главную
event.on('location:home', msg => {
  state[msg.from.id] = []
  event.emit('location:back', msg)
})

// Главная меню
event.on('home', (msg, action, next) => {
  send.keyboard(msg.from.id, 'Выберите действие', action, 2)
  next && next()
})

// Экспортируем объект события
exports.event = event

// А так же состояние
exports.state = state
