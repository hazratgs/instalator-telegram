const Model = require('../models/source')

// Источники
exports.list = async () => Model.Source.find({})

// Добавить новый источник
exports.create = async data =>
  new Model.Source({
    name: data.name,
    source: data.source,
    count: data.source.length
  }).save()

// Проверить существование источника
exports.contains = async name => Model.Source.findOne({ name: name })

// Удалить элемент из источника
exports.removeUserSource = async (source, user) =>
  Model.Source.update(
    {
      name: source
    },
    {
      $pull: {
        source: user
      }
    }
  )

// Удаление
exports.remove = async name => Model.Source.remove({ name: name })
