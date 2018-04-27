const bot = require('../telegram')
const emoji = require('./emoji')

// Send message
exports.message = (user, message, options = {}) =>
  bot.sendMessage(user, message, options)

// Sending Messages with the keyboard
exports.keyboard = (user, message, data, inline = 2, options = {}) => {
  let opt = [], arr = [], i = 0

  // If the map object entered, we take the data from the current branch
  if (!Array.isArray(data)) {
    for (let item in data.children) {
      arr.push(item)
    }
  } else {
    // Received a normal array
    arr = data
  }

  for (let key of arr) {
    if (key === '*') continue
    // If the inline is greater than 1, then insert the inline elements in one line
    if (i < inline && opt[opt.length - 1] !== undefined) {
      opt[opt.length - 1].push({
        text: emoji.encode(key)
      })
    } else {
      if (i === inline) i = 0
      opt.push([
        {
          text: emoji.encode(key)
        }
      ])
    }

    i++
  }

  bot.sendMessage(user, message, {
    reply_markup: {
      keyboard: opt,
      resize_keyboard: true
      // one_time_keyboard: true
    },
    ...options
  })
}

// Send a message with the keyboard hiding
exports.messageHiddenKeyboard = (user, message) => {
  bot.sendMessage(user, message, {
    reply_markup: {
      remove_keyboard: true
    }
  })
}
