const Model = require('../models/user')

// Проверка существования пользователя
exports.contains = async id => Model.User.findOne({ id: id })

// Добавление нового пользователя
exports.create = async data =>
  new Model.User({
    id: data.id,
    name: data.name
  }).save()

// Очистка базы пользователей
exports.cleaner = async () => Model.User.remove({})
