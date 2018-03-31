const Model = require('../models/source')

// Источники
exports.list = () => Model.Source.find({})

// Добавить новый источник
exports.create = data =>
  new Model.Source({
    name: data.name,
    source: data.source,
    count: data.source.length
  }).save()

// Проверить существование источника
exports.contains = name => Model.Source.findOne({ name: name })

// Удалить элемент из источника
exports.removeUserSource = (source, user) =>
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
exports.remove = name => Model.Source.remove({ name: name })
