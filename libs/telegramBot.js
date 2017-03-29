let conf = require('../conf/index');
let TelegramBot = require('node-telegram-bot-api');

let token = conf.get('telegram:token');
let bot = new TelegramBot(token, { polling: true });

module.exports = bot;