const Account = require('../controllers/account')
const Source = require('../controllers/source')
const Task = require('../controllers/task')
const actions = require('../actions')

module.exports = (event, state, map, send) => {
  // Create an assignment
  event.on('task:create', (msg, action, next) => {
    event.emit('account:list', msg)
    next && next()
  })

  // Select an account for the job
  event.on('task:select', async (msg, action, next) => {
    try {
      const check = await Account.contains(msg.from.id, msg.text)
      if (check === null) {
        throw new Error(`Аккаунт ${msg.text} не существует, выберите другой`)
      }

      try {
        // Check if there are active jobs on the account
        const task = await Task.current(msg.from.id, msg.text)
        if (task === null) throw new Error()

        // Active task is
        send.message(
          msg.from.id,
          `Есть активное задание у ${msg.text}, попробуйте позже.`
        )
        event.emit('account:list', msg)
      } catch (e) {
        send.keyboard(msg.from.id, `Выберите действие`, action)
        next && next()
      }
    } catch (e) {
      send.message(
        msg.from.id,
        `Аккаунт ${msg.text} не существует, выберите другой`
      )
    }
  })

  // Selecting the type of task
  event.on('task:select:type', (msg, action, next) => {
    switch (msg.text) {
      case 'Лайк + Подписка':
        event.emit('task:select:follow+like', msg, action)
        break

      case 'Отписка':
        send.keyboard(
          msg.from.id,
          `Сколько отписок в день совершать?`,
          ['50', '150', '300', '500', 'Назад'],
          4
        )
        next && next()
        break

      default:
        send.message(msg.from.id, `Ошибка, выберите действие`)
        break
    }
  })

  // Select Source Type
  event.on('task:select:follow+like', (msg, action, next) => {
    send.keyboard(msg.from.id, `Выберите тип источника`, action)
    next && next()
  })

  // The name of the user whose subscribers you need to receive
  event.on('task:select:follow+like:user', (msg, action, next) => {
    send.keyboard(
      msg.from.id,
      `Введите имя пользователя, подписчиков которого вам нужно получить`,
      action
    )
    next && next()
  })

  // Number of Subscriptions
  event.on('task:select:follow+like:user:select', async (msg, action, next) => {
    try {
      const { login, password } = await Account.contains(
        msg.from.id,
        state[msg.from.id][1]
      )
      const session = await actions.auth(login, password)
      const searchUser = await actions.searchUser(session, msg.text)

      send.message(
        msg.from.id,
        `Профиль ${msg.text} найден, количество подписчиков: ${searchUser._params.followerCount}`
      )

      // Кол. действия
      send.keyboard(msg.from.id, 'Введите количество Подписок', [
        '2500',
        '5000',
        '7500',
        'Назад'
      ])
      next && next()
    } catch (e) {
      send.message(
        msg.from.id,
        `Пользователь ${msg.text} не найден, попробуйте еще раз`
      )
      next && next()
      event.emit('location:back', msg)
    }
  })

  // Location
  event.on('task:select:follow+like:geo', (msg, action, next) => {
    send.keyboard(
      msg.from.id,
      `В разработке, выберите другой тип источника`,
      action
    )
    next && next()
    event.emit('location:back', msg)
  })

  // Hashtag
  event.on('task:select:follow+like:hashtag', (msg, action, next) => {
    try {
      send.keyboard(msg.from.id, `По какому хэштегу искать?`, ['Назад'])
      next && next()
    } catch (e) {
      next && next()
      event.emit('location:back', msg)
    }
  })

  // Hashtag
  event.on(
    'task:select:follow+like:hashtag:find',
    async (msg, action, next) => {
      try {
        send.message(msg.from.id, `Пожалуйста, подождите...`)

        const { login, password } = await Account.contains(
          msg.from.id,
          state[msg.from.id][1]
        )
        const session = await actions.auth(login, password)
        const info = await actions.infoHashtag(session, msg.text)

        send.message(
          msg.from.id,
          `По хэштегу #${msg.text} найдено ${info.params.mediaCount} записи`
        )

        setTimeout(
          () =>
            send.keyboard(msg.from.id, 'Введите количество Подписок', [
              info.params.mediaCount < 2500 ? info.params.mediaCount : '2500',
              '5000',
              '7500',
              'Назад'
            ]),
          600
        )
        next && next()
      } catch (e) {
        next && next()
        event.emit('location:back', msg)
      }
    }
  )

  // List of sources
  event.on('task:select:follow+like:source', async (msg, action, next) => {
    try {
      const list = await Source.list()
      if (!list.length) throw new Error('К сожалению нет источников')

      const source = list
        .sort((a, b) => (a.count > b.count ? -1 : 1))
        .map(item => item.name)
        .reduce((sum, item) => {
          if (sum.length > 20) return sum
          return [...sum, item]
        }, [])

      // Selected action
      send.keyboard(msg.from.id, `Выберите источник`, [...source, 'Назад'])
      next && next()
    } catch (e) {
      send.message(msg.from.id, e.message)
      next && next()
      event.emit('location:back', msg)
    }
  })

  // Select Source
  event.on(
    'task:select:follow+like:source:select',
    async (msg, action, next) => {
      try {
        const check = await Source.contains(msg.text)
        if (check === null) throw new Error('Ошибка, нет такого источника')

        // Qty. actions
        send.keyboard(msg.from.id, 'Введите количество Подписок', [
          '2500',
          '5000',
          '7500',
          'Назад'
        ])
        next && next()
      } catch (e) {
        send.message(msg.from.id, e)
      }
    }
  )

  // Number of actions
  event.on('task:select:follow+like:source:action', (msg, action, next) => {
    let length = parseInt(msg.text)
    if (isNaN(length) || length > 7500) {
      send.message(msg.from.id, 'Не более 7500 подписчиков в одном задании')
      return null
    }

    // Please enter the number. likes to profile
    send.keyboard(msg.from.id, 'К скольким в день подписываться?', [
      '300',
      '500',
      '750',
      '1000',
      'Назад'
    ])
    next && next()
  })

  // Number of actions per day
  event.on(
    'task:select:follow+like:source:actionPerDay',
    (msg, action, next) => {
      let length = parseInt(msg.text)
      if (isNaN(length) || length > 1500) {
        send.message(
          msg.from.id,
          'Слишком много, могут заблокировать. Попробуй еще раз...'
        )
        return null
      }

      // Please enter the number. likes to profile
      send.keyboard(msg.from.id, 'Сколько лайков ставить?', [
        '1',
        '2',
        '3',
        '4',
        '5',
        'Назад'
      ])
      next && next()
    }
  )

  // Number of likes to photos
  event.on('task:select:follow+like:source:like', (msg, action, next) => {
    let length = parseInt(msg.text)
    if (isNaN(length) || length > 5) {
      send.message(msg.from.id, 'Думаю это слишко много...')
      return null
    }
    next()

    // Save job
    event.emit('task:create:follow+like:save', msg, action)
  })

  // Create an assignment
  event.on('task:create:follow+like:save', async (msg, action) => {
    let data = state[msg.from.id]
    data.splice(0, 1)

    try {
      // Examination of existence
      const task = await Task.current(msg.from.id, data[0])
      if (task === null) throw new Error()

      send.message(
        msg.from.id,
        'У этого аккаунта есть активное задание, дождитесь завершения.'
      )

      // We pass to the main
      event.emit('location:home', msg)
    } catch (e) {
      let source = data[3]
      if (data[2] === 'Хештег') source = `#${source}`
      
      // Create an assignment
      await Task.createFollowLike({
        user: msg.from.id,
        login: data[0],
        type: data[1],
        sourceType: data[2],
        source: source,
        action: data[4],
        actionDay: data[5],
        like: data[6]
      })

      send.message(
        msg.from.id,
        'Задание успешно добавлено, подробнее можете посмотреть в активности'
      )

      // We pass to the main
      event.emit('location:home', msg)
    }
  })

  // Unsubscription
  event.on('task:select:type:unfollow', (msg, action, next) => {
    let length = parseInt(msg.text)
    if (isNaN(length) || length > 1500) {
      send.message(msg.from.id, 'Не более 1500 отписок в одном задании')
      return null
    }
    next()

    event.emit('task:select:type:unfollow:save', msg, action)
  })

  // Create an assignment
  event.on('task:select:type:unfollow:save', async (msg, action) => {
    let data = state[msg.from.id]
    data.splice(0, 1)

    try {
      // Проверка существования задачи
      const task = await Task.current(msg.from.id, data[0])
      if (task === null) throw new Error('Нет активных заданий')

      send.message(
        msg.from.id,
        'У этого аккаунта есть активное задание, дождитесь завершения.'
      )

      // We pass to the main
      event.emit('location:home', msg)
    } catch (e) {
      await Task.createUnFollow({
        user: msg.from.id,
        login: data[0],
        type: data[1],
        actionFollowingDay: data[2]
      })

      send.message(
        msg.from.id,
        'Задание успешно добавлено, подробнее можете посмотреть в активности'
      )

      // We pass to the main
      event.emit('location:home', msg)
    }
  })
}
