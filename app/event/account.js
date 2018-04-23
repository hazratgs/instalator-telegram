const Account = require('../controllers/account')
const Source = require('../controllers/source')
const Task = require('../controllers/task')
const actions = require('../actions')

module.exports = (event, state, map, send) => {
  // List of accounts
  event.on('account:list', async (msg, action, next) => {
    try {
      const list = await Account.list(msg.from.id)
      if (list === null) {
        throw new Error(`There are no accounts for ${msg.from.id}`)
      }

      // Sending the list of accounts
      const elements = list.map(item => item.login)
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

  // No accounts added
  event.on('account:empty', (msg, action, next) =>
    send.keyboard(msg.from.id, 'У вас нет ни одного аккаунта', [
      'Добавить аккаунт',
      'Назад'
    ])
  )

  // Add account
  event.on('account:add', (msg, action, next) => {
    send.keyboard(msg.from.id, 'Введите логин и пароль через пробел', ['Назад'])
    next && next()
  })

  // Waiting for Account Login
  event.on('account:await', (msg, action, next) => {
    try {
      const account = msg.text.split(' ')
      const login = account[0]
      const password = account[1]

      // Error handling
      if (account.length !== 2) throw new Error('Не передан логин/пароль')

      // Save the data
      event.emit('account:add:save', msg, login, password)
    } catch (e) {
      // One of the parameters is not passed
      event.emit('account:add:err', msg)
    }
  })

  // Error adding account, no username / password
  event.on('account:add:err', (msg, action, next) =>
    send.keyboard(msg.from.id, 'Не передан пароль', ['Назад'])
  )

  // Save account
  event.on('account:add:save', async (msg, login, password) => {
    try {
      const check = await Account.containsAllUsers(login)
      if (check === null) throw new Error(`${login} уже используется!`)

      send.message(msg.from.id, `Подождите немного, пытаюсь авторизоваться`)

      try {
        // Availability check
        const auth = await actions.auth(login, password)

        // Adding to the database
        await Account.add(msg.from.id, login, password)

        send.message(
          msg.from.id,
          `🔑 Аккаунт ${login} успешно добавлен, войдите в Instagram и подтвердите, что это были вы`
        )
        event.emit('location:home', msg)
      } catch (e) {
        if (e.name === 'SentryBlockError') {
          send.message(
            msg.from.id,
            '⛔️ Instagram отказал в доступе, попробуйте позже'
          )
        } else {
          send.message(
            msg.from.id,
            '⛔️ Возникла ошибка при авторизации, проверьте правильность логина/пароля'
          )
        }
      }
    } catch (e) {
      // Account added earlier
      send.message(msg.from.id, e)
    }
  })

  // Choose an account
  event.on('account:select', async (msg, action, next) => {
    try {
      // Search for an account in the database
      const account = await Account.contains(msg.from.id, msg.text)
      if (!account) throw new Error('Аккаунт не существует')

      send.keyboard(msg.from.id, 'Выберите действия для ' + msg.text, action)
      next && next()
    } catch (e) {
      send.message(
        msg.from.id,
        `Аккаунт ${msg.text} не существует, выберите другой`
      )
    }
  })

  // Account deleting
  event.on('account:delete', async msg => {
    const login = state[msg.from.id][state[msg.from.id].length - 1]

    try {
      // Check the existence of an account
      const account = await Account.contains(msg.from.id, login)
      if (!account) throw new Error('Аккаунт не существует')

      try {
        // Delete
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

  // Edit account
  event.on('account:edit', async (msg, action, next) => {
    try {
      send.keyboard(msg.from.id, 'Введите логин и пароль через пробел', [
        'Назад'
      ])
      next && next()
    } catch (e) {
      send.message(msg.from.id, 'Аккаунт не найден!')
      event.emit('location.back', msg)
    }
  })

  // Waiting for a new password pair to be entered
  event.on('account:edit:await', (msg, action, next) => {
    try {
      const [newLogin, newPassword] = msg.text.split(' ')

      // Error handling
      if (!newLogin || !newPassword) throw new Error('Не передан логин/пароль')

      // Save the data
      event.emit('account:edit:save', msg, newLogin, newPassword)
    } catch (e) {
      // One of the parameters is not passed
      event.emit('account:add:err', msg)
    }
  })

  // Save
  event.on('account:edit:save', async (msg, newLogin, newPassword) => {
    try {
      const [, login] = state[msg.from.id]
      const check = await Account.containsAllUsers(login)
      if (check === null) throw new Error(`${login} уже используется!`)

      send.message(msg.from.id, `Подождите немного, пытаюсь авторизоваться`)

      try {
        // Availability check
        await actions.auth(newLogin, newPassword)

        // Adding to the database
        await Account.changeAccount(msg.from.id, login, newLogin, newPassword)

        send.message(msg.from.id, `🎉 Аккаунт ${login} успешно отредактирован`)
        event.emit('location:home', msg)
      } catch (e) {
        send.message(
          msg.from.id,
          'Возникла ошибка при авторизации, проверьте правильность логина/пароля'
        )
      }
    } catch (e) {
      // Account added earlier
      send.message(msg.from.id, e)
    }
  })
}
