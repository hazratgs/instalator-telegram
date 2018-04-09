const Model = require('../models/source')

// Sources of information
exports.list = async () => Model.Source.find({})

// Add new source
exports.create = async data =>
  new Model.Source({
    name: data.name,
    source: data.source,
    count: data.source.length
  }).save()

// Check the existence of the source
exports.contains = async name => await Model.Source.findOne({ name: name })

// Remove item from source
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

// Delete
exports.remove = async name => await Model.Source.findOne({ name: name }).remove()