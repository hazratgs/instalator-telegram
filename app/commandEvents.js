const ee = require('events')
const event = new ee.EventEmitter()
const send = require('./send')
const map = require('./map')

event.on('/start', msg => {
  send.keyboard(
    msg.from.id,
    `✋ Привет ${msg.from.first_name},\r
я 🤖 instalator - комплекс для автоматизации продвижения аккаунтов instagram.\r
Первое, что необходимо сделать, это добавить аккаунт`,
    map
  )
})

event.on('/home', msg => {
  send.keyboard(msg.from.id, 'Выберите действие', map, 2)
})

module.exports = event
