const TelegramBot = require('node-telegram-bot-api')
const conf = require('./conf')
const bot = new TelegramBot(conf.token)
const express = require('express')
const bodyParser = require('body-parser')

// This informs the Telegram servers of the new webhook.
bot.setWebHook(`${conf.url}/bot${conf.token}`)

const app = express()

// parse the updates to JSON
app.use(bodyParser.json())

// We are receiving updates at the route below!
app.post(`/bot${conf.token}`, (req, res) => {
  bot.processUpdate(req.body)
  res.sendStatus(200)
})

// Start Express Server
app.listen(conf.port, () => {
  console.log(`Express server is listening on ${conf.port}`)
})

module.exports = bot
