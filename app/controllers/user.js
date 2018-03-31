const Model = require('../models/user')

// Проверка существования пользователя
exports.contains = id => Model.User.findOne({ id: id })

// Добавление нового пользователя
exports.create = data =>
  new Model.User({
    id: data.id,
    name: data.name
  }).save()

// Очистка базы пользователей
exports.cleaner = () => Model.User.remove({})
