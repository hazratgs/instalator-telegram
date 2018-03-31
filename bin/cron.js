const cron = require('node-cron')
const send = require('../app/bot/method')

const Task = require('../app/controllers/task')
const Instanode = require('./instanode')

// Активные задания
let activeTask = []

// Запускаем активные задания
cron.schedule('15 */1 * * *', async () => {
  try {
    let list = await Task.currentList()
    if (list === null) throw new Error('Нет активных заданий')

    for (let item of list) {
      let id = item._id.toString()

      // Пропускаем выполняющиеся задания
      if (activeTask.includes(id)) continue

      console.log(`Start ${item.login} ${new Date()}`)

      switch (item.type) {
        case 'Лайк + Подписка':
          activeTask.push(id)
          Instanode.followLike(item)
            .then(finish => {
              // Удаляем из списка выполняемых
              let keyActiveTask = activeTask.indexOf(id)
              delete activeTask[keyActiveTask]

              console.log(`Stop ${item.login} ${new Date()}`)

              // оповещаем пользователя о завершении задания
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
          Instanode.unFollow(item)
            .then(finish => {
              // Удаляем из списка выполняемых
              let keyActiveTask = activeTask.indexOf(id)
              delete activeTask[keyActiveTask]

              console.log(`Stop ${item.login} ${new Date()}`)

              // оповещаем пользователя о завершении задания
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
          // Тип задания не определен
          break
      }
    }
  } catch (e) {
    // Нет активных заданий
    console.log(e)
  }
})
