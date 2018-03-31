/*!
 * instalator-telegram
 * Copyright(c) 2018 Hazrat Gadjikerimov
 * MIT Licensed
 */

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const conf = require('./conf.json')
const cors = require('cors')

app.use(cors())
app.use(bodyParser.json({ limit: '5mb' }))
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: '5mb'
  })
)

// Telegram bot
const bot = require('./app/bot')

// Task manager
const cron = require('./bin/cron')

const application = require('./app/routes')(app)

// Start app
app.listen(conf.port), () =>
  console.info(`Express app run to port: ${conf.port}`)
