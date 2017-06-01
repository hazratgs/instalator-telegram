const conf = require('../conf/index');
const TelegramBot = require('node-telegram-bot-api');

const token = conf.get('telegram:token');
const bot = new TelegramBot(token, { polling: true });

module.exports = bot;