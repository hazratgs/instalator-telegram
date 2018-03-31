const Publication = require('../../controllers/publication')
const Account = require('../../controllers/account')

module.exports = (event, state, map, send) => {
  // Главное меню
  event.on('publication', (msg, action, next) => {
    send.keyboard(msg.from.id, 'Выберите действие', action)
    next && next()
  })

  // Выбор аккаунта для новой публикации
  event.on('publication:account', (msg, action, next) => {
    event.emit('account:list', msg)
    next && next()
  })

  // Добавить отложенную публикацию
  event.on('publication:create', async (msg, action, next) => {
    try {
      let check = await Account.contains(msg.from.id, msg.text)
      if (check === null) {
        throw new Error(`Аккаунт ${msg.text} не существует, выберите другой`)
      }

      // Аккаунт существует, просим загрузить фото
      send.keyboard(msg.from.id, 'Загрузите фотографию', ['Назад'])
      next && next()
    } catch (e) {
      send.message(
        msg.from.id,
        `Аккаунт ${msg.text} не существует, выберите другой`
      )
    }
  })

  // Добавить отложенную публикацию
  event.on('publication:create:upload', async (msg, action, next) => {
    if (!msg.hasOwnProperty('photo')) {
      send.message(msg.from.id, 'Ошибка, я жду фотографию')
      return null
    }

    try {
      // Загружаем фото
      let name = await Publication.upload(msg)

      // Переходим к следующему шагу
      send.message(msg.from.id, 'Фотография успешно загружена')
      send.message(msg.from.id, 'Введите подпись')
      next(name)
    } catch (e) {
      send.message(msg.from.id, 'Возникла ошибка, повторите еще раз')
    }
  })

  // Подпись для новой отложенной публикации
  event.on('publication:create:title', async (msg, action, next) => {
    send.message(
      msg.from.id,
      'Укажите время публикации (мин час день месяц год), пример: 30 19 04 08 2017'
    )
    next()
  })

  // Обработка даты публикации
  event.on('publication:create:date', (msg, action, next) => {
    let date = new Date()

    // Здесь храним актуальную дату, чтобы пользователь мог вводить, например только минуты
    // или минтуы и часы, в этом случаи день, месяц и год будут автоматически
    // использоваться текущие
    let startDate = [
      date.getMinutes(),
      date.getHours(),
      date.getDay(),
      date.getMonth(),
      date.getFullYear()
    ]

    // Мутабельное решение, изменяем первоначальное состояние,
    // дабы клиенты наши кайфанули от того, что не надо писать
    // полностью дату публикации поста (30 19 10 06 2017),
    // а очень коротко (30 19) и он опубликуется сегодня в 19:30
    msg.text.split(' ').map((item, index) => (startDate[index] = item))

    // Cохранение отложенной публикации
    try {
      Publication.create({
        user: msg.from.id,
        login: 'account',
        title: state[msg.from.id][4],
        date: new Date(...startDate.reverse()),
        image: state[msg.from.id][3]
      })

      send.message(msg.from.id, 'Задание успешно добавлено!')
      event.emit('location:home', msg)
    } catch (e) {
      send.message(
        msg.from.id,
        'Возникла ошибка при сохранении, повторите позже.'
      )
      event.emit('location:home', msg)
    }
  })

  // Список публикаций, ожидающих публикацию (тавтология)
  event.on('publication:await', (msg, action, next) => {
    send.message(
      msg.from.id,
      'Тут короче большой список постов, ожидающих публикацию'
    )
    next && next()
  })
}
