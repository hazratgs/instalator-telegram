const Account = require('../controllers/account')
const Source = require('../controllers/source')
const Task = require('../controllers/task')

module.exports = (event, state, map, send) => {
  // User activity
  event.on('actions', async (msg, action, next) => {
    try {
      const list = await Account.list(msg.from.id)
      if (list === null) throw new Error('Нет ни одного аккаунта')

      // Sending the list of accounts
      const elements = list.map(item => item.login)
      send.keyboard(msg.from.id, 'Выберите аккаунт', [...elements, 'Назад'])
      next && next()
    } catch (e) {
      send.keyboard(msg.from.id, 'У вас нет ни одного аккаунта', ['Назад'])
      next && next()
    }
  })

  // Output of information about the activity of the Account
  event.on('actions:account', async (msg, action, next) => {
    try {
      const account = await Account.contains(msg.from.id, msg.text)
      const task = await Task.current(msg.from.id, msg.text)

      let text = ''
      let daily = ''

      switch (task.type) {
        case 'Лайк + Подписка':
          daily = Math.round(
            (task.params.actionFollow - task.params.following.length) /
              task.params.actionFollowDay
          )
          text = `Активность ${task.login}\nТип задачи: ${task.type}\nСостояние: ${task.params.actionFollow}/${task.params.following.length}\nПодписок в день: ${task.params.actionFollowDay}\nЛайков в день: ${task.params.actionLikeDay}\nИсточник: ${task.params.source}\nДата завершения: ${daily} дней`
          break

        case 'Отписка':
          daily = Math.round(
            (task.params.following.length - task.params.unFollowing.length) /
              task.params.actionFollowingDay
          )
          text = `Активность ${task.login}\nТип задачи: ${task.type}\nСостояние: ${task.params.following.length}/${task.params.unFollowing.length}\nОтписок в день: ${task.params.actionFollowingDay}\nДата завершения: ${daily} дней`
          break

        default:
          break
      }

      send.keyboard(msg.from.id, text, ['Редактировать', 'Отменить', 'Назад'])
      next && next()
    } catch (err) {
      send.message(msg.from.id, 'Нет активного задания')
      next && next()
      event.emit('location:back', msg)
    }
  })

  // Cancel a task
  event.on('actions:account:cancel', async (msg, action, next) => {
    try {
      const data = state[msg.from.id]
      const account = await Account.contains(msg.from.id, data[1])
      const task = await Task.current(msg.from.id, data[1])

      await Task.cancel(task._id)
      send.message(msg.from.id, `🔴 Задание ${task.type} отменена`)

      event.emit('location:back', msg)
    } catch (err) {
      send.message(msg.from.id, 'Возникла ошибка, повторите')
      next && next()
      event.emit('location:back', msg)
    }
  })

  // Editing a task
  event.on('actions:account:update', async (msg, action, next) => {
    try {
      const account = await Account.contains(msg.from.id, state[msg.from.id][1])
      const task = await Task.current(msg.from.id, account.login)

      switch (task.type) {
        case 'Отписка':
          send.keyboard(msg.from.id, 'Введите новое количеств отписок в день', [
            'Назад'
          ])
          next()
          break

        case 'Лайк + Подписка':
          send.keyboard(msg.from.id, 'Сколько подписок нужно выполнить?', [
            '1000',
            '3000',
            '5000',
            '7000',
            'Назад'
          ])
          next()
          break

        default:
          throw new Error('Не верный тип задания!')
          break
      }
    } catch (err) {
      event.emit('location:back', msg)
    }
  })

  // Editing processing, the first step
  event.on('actions:account:update:one', async (msg, action, next) => {
    try {
      const account = await Account.contains(msg.from.id, state[msg.from.id][1])
      const task = await Task.current(msg.from.id, account.login)

      switch (task.type) {
        case 'Отписка':
          const action = parseInt(msg.text)
          if (isNaN(action)) {
            send.message(msg.from.id, 'Введите число!')
            return false
          }

          // We update the count. subscriptions per day
          Task.updateActionDayUnFollowing(task._id, msg.text)
          send.message(msg.from.id, 'Изменения успешно сохранены')

          event.emit('location:back', msg)
          break

        case 'Лайк + Подписка':
          const actionDay = parseInt(msg.text)
          if (isNaN(actionDay)) {
            send.message(msg.from.id, 'Введите число!')
            return false
          }

          send.keyboard(msg.from.id, 'К скольким подписываться в сутки?', [
            '500',
            '750',
            '1000',
            '1200',
            'Назад'
          ])
          next()
          break

        default:
          throw new Error('Не верный тип задания!')
          break
      }
    } catch (err) {
      event.emit('location:back', msg)
    }
  })

  event.on('actions:account:update:two', async (msg, action, next) => {
    try {
      const account = await Account.contains(msg.from.id, state[msg.from.id][1])
      const task = await Task.current(msg.from.id, account.login)

      switch (task.type) {
        case 'Лайк + Подписка':
          const actionDay = parseInt(msg.text)
          if (isNaN(actionDay)) {
            send.message(msg.from.id, 'Введите число!')
            return false
          }

          send.keyboard(msg.from.id, 'Сколько лайков ставить?', [
            '1',
            '2',
            '3',
            '5',
            'Назад'
          ])
          next()
          break

        default:
          throw new Error('Не верный тип задания!')
          break
      }

    } catch (e) {
      event.emit('location:back', msg)
    }
  })

  event.on('actions:account:update:three', async (msg, action, next) => {
    try {
      const account = await Account.contains(msg.from.id, state[msg.from.id][1])
      const task = await Task.current(msg.from.id, account.login)

      switch (task.type) {
        case 'Лайк + Подписка':
          const actionLikeDay = parseInt(msg.text)
          if (isNaN(actionLikeDay)) {
            send.message(msg.from.id, 'Введите число!')
            return false
          }
          // New data
          const [,,, actionFollow, actionFollowDay] = state[msg.from.id]

          // Update
          await Task.updateActionsFollowing(task._id, {
            actionFollow: actionFollow,
            actionFollowDay: actionFollowDay,
            actionLikeDay: actionLikeDay
          })
          send.message(msg.from.id, 'Изменения успешно сохранены')

          event.emit('location:home', msg)
          break

        default:
          throw new Error('Не верный тип задания!')
          break
      }

    } catch (e) {
      event.emit('location:back', msg)
    }
  })
}
