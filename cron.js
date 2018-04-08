const cron = require('node-cron')
const send = require('./app/send')
const task = require('./app/controllers/task')
const actions = require('./app/actions')

// Active quests
const activeTask = []

// Run active tasks
cron.schedule('28 */1 * * *', async () => {
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
            .then(finish => {
              // Remove from list
              const keyActiveTask = activeTask.indexOf(id)
              delete activeTask[keyActiveTask]

              // notify the user when the task is completed
              if (finish) {
                send.message(
                  item.user,
                  `Задание ${item.type} завершено для аккаунта ${item.login}`
                )
              }
            })
            .catch(e => console.log(e.message))
          break

        case 'Отписка':
          activeTask.push(id)
          actions
            .unFollow(item)
            .then(finish => {
              // Remove from list
              const keyActiveTask = activeTask.indexOf(id)
              delete activeTask[keyActiveTask]

              // notify the user when the task is completed
              if (finish) {
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
