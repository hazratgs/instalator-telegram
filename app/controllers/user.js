const Model = require('../models/user')

// User Existence Check
exports.contains = async id => Model.User.findOne({ id: id })

// Adding a new user
exports.create = async data =>
  await new Model.User({
    id: data.id,
    name: data.name
  }).save()

// Cleaning up the user database
exports.cleaner = async () => Model.User.remove({})
