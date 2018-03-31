const Account = require('../../controllers/account')
const Source = require('../../controllers/source')
const Task = require('../../controllers/task')
const instanode = require('../../../bin/instanode')

module.exports = (event, state, map, send) => {
  // Список аккаунтов
  event.on('account:list', async (msg, action, next) => {
    try {
      let list = await Account.list(msg.from.id)
      if (list === null) {
        throw new Error(`There are no accounts for ${msg.from.id}`)
      }

      // Отправляем список аккаунтов
      let elements = list.map(item => item.login)
      send.keyboard(msg.from.id, 'Выберите аккаунт', [
        ...elements,
        'Добавить аккаунт',
        'Назад'
      ])

      next && next()
    } catch (e) {
      event.emit('account:empty', msg)
      next && next()
    }
  })

  // Нет добавленных аккаунтов
  event.on('account:empty', (msg, action, next) =>
    send.keyboard(msg.from.id, 'У вас нет ни одного аккаунта', [
      'Добавить аккаунт',
      'Назад'
    ])
  )

  // Добавить аккаунт
  event.on('account:add', (msg, action, next) => {
    send.keyboard(msg.from.id, 'Введите логин и пароль через пробел', ['Назад'])
    next && next()
  })

  // Ожидание ввода аккаунта
  event.on('account:await', (msg, action, next) => {
    try {
      let account = msg.text.split(' ')
      let login = account[0]
      let password = account[1]

      // Обработка ошибки
      if (account.length !== 2) throw new Error('Не передан логин/пароль')

      // Сохраняем данные
      event.emit('account:add:save', msg, login, password)
    } catch (e) {
      // Не передан один из параметров
      event.emit('account:add:err', msg)
    }
  })

  // Ошибка добавления аккаунта, не передан логин/пароль
  event.on('account:add:err', (msg, action, next) =>
    send.keyboard(msg.from.id, 'Не передан пароль', ['Назад'])
  )

  // Сохранение аккаунта
  event.on('account:add:save', async (msg, login, password) => {
    try {
      let check = await Account.containsAllUsers(login)
      if (check === null) throw new Error(`${login} уже используется!`)

      send.message(msg.from.id, `Подождите немного, пытаюсь авторизоваться`)

      try {
        // Проверка доступности
        await instanode.auth(login, password)

        // Добавление в базу
        await Account.add(msg.from.id, login, password)

        send.message(
          msg.from.id,
          `Аккаунт ${login} успешно добавлен, войдите в Instagram и подтвердите, что это были вы`
        )
        event.emit('location:home', msg)
      } catch (e) {
        send.message(
          msg.from.id,
          'Возникла ошибка при авторизации, проверьте правильность логина/пароля'
        )
      }
    } catch (e) {
      // Аккаунт добавлен ранее
      send.message(msg.from.id, e)
    }
  })

  // Выбор аккаунта
  event.on('account:select', async (msg, action, next) => {
    try {
      // Поиск аккаунта в базе
      await Account.contains(msg.from.id, msg.text)

      send.keyboard(msg.from.id, 'Выберите действия для ' + msg.text, action)
      next && next()
    } catch (e) {
      send.message(
        msg.from.id,
        `Аккаунт ${msg.text} не существует, выберите другой`
      )
    }
  })

  // Удаление аккаунта
  event.on('account:delete', async msg => {
    let login = state[msg.from.id][state[msg.from.id].length - 1]

    try {
      // Проверяем существование аккаунта
      await Account.contains(msg.from.id, login)

      try {
        // Удаление
        await Account.remove(msg.from.id, login)

        send.message(msg.from.id, `Аккаунт ${login} удален`)
        event.emit('location:back', msg)
      } catch (e) {
        send.message(
          msg.from.id,
          `Возникла ошибка, пожалуйста повторите позже.`
        )
        event.emit('location:back', msg)
      }
    } catch (e) {
      send.message(msg.from.id, 'Аккаунт не найден!')
      event.emit('location.back', msg)
    }
  })
}
