const TelegramBot = require('node-telegram-bot-api')
const conf = require('../conf.json')
const bot = new TelegramBot(conf.token, { polling: true })

module.exports = bot
