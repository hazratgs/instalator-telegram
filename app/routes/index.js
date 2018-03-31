const path = process.cwd()
const bot = require(path + '/libs/telegramBot')
const conf = require(path + '/conf.json')

// Routes
const source = require('./source')

module.exports = app => {
  // RESTful api
  source(app)

  // Если нет обработчиков, 404
  app.use((req, res, next) => {
    res.status(404)
    res.send({ ok: false, error_code: 404, description: 'Not found' })
  })

  // Возникла ошибка
  app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send({ ok: false, error_code: 500, description: err.message })

    // Оповещаем разработчика об ошибке
    bot.sendMessage(conf.telegram.user, err.message)
  })
}
