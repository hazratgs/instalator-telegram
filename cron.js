const cron = require('node-cron')
const send = require('./app/send')
const task = require('./app/controllers/task')
const actions = require('./app/actions')
const conf = require('./conf.json')

// Active quests
const activeTask = []

// Run active tasks
cron.schedule(conf.cron, async () => {
  try {
    const list = await task.currentList()
    if (list === null) throw new Error('No active assignments')

    for (let item of list) {
      const id = item._id.toString()

      // Missing running tasks
      if (activeTask.includes(id)) continue

      switch (item.type) {
        case 'Лайк + Подписка':
          activeTask.push(id)
          actions
            .followLike(item)
            .then(res => {
              // Remove from list
              const keyActiveTask = activeTask.indexOf(id)
              delete activeTask[keyActiveTask]

              if (res.name === 'AuthenticationError') {
                send.message(
                  item.user,
                  `⛔️ При входе в ${item.login} возникла ошибка, отредактируйте акккаунт!`
                )
                throw new Error('Ошибка авторизации')
              }

              // notify the user when the task is completed
              if (res) {
                send.message(
                  item.user,
                  `Задание ${item.type} завершено для аккаунта ${item.login}`
                )
              }
            })
            .catch(e => console.log(e))
          break

        case 'Отписка':
          activeTask.push(id)
          actions
            .unFollow(item)
            .then(res => {
              // Remove from list
              const keyActiveTask = activeTask.indexOf(id)
              delete activeTask[keyActiveTask]

              if (res.name === 'AuthenticationError') {
                send.message(
                  item.user,
                  `⛔️ При входе в ${item.login} возникла ошибка, отредактируйте акккаунт!`
                )
                throw new Error('Ошибка авторизации')
              }

              // notify the user when the task is completed
              if (res) {
                send.message(
                  item.user,
                  `Задание ${item.type} завершено для аккаунта ${item.login}`
                )
              }
            })
            .catch(e => console.log(e))
          break

        default:
          // Job type is not defined
          break
      }
    }
  } catch (e) {
    // No active assignments
    return e
  }
})
