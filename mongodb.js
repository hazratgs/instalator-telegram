const mongoose = require('mongoose')
const conf = require('./conf')

mongoose.Promise = global.Promise
mongoose.connect(conf.mongoose.uri)

const db = mongoose.connection

db.on('error', err => console.log('connection error:', err.message))

// MongoDB
exports.mongoose = mongoose

// This DB
exports.connect = db
