const ee = require('events')
const event = new ee.EventEmitter()
const send = require('../send')
const map = require('../map')

// Locking User Location
const state = {}

// Main Components
const account = require('./account')(event, state, map, send)
const action = require('./action')(event, state, map, send)
const task = require('./task')(event, state, map, send)
const limit = require('./limit')(event, state, map, send)

// Change the location of the user
event.on('location:next', (msg, action, value) => {
  if (action.event !== 'location:back' && !action.await) {
    state[msg.from.id].push(value)
  }
})

// Go back one step
event.on('location:back', msg => {
  // Delete the current location
  state[msg.from.id].splice(-1, 1)

  const reducer = state[msg.from.id].reduce((path, item) => {
    // We use the value from the state for the common branch,
    // that would not be such, for example return from the general branch in the general
    // would lead to a choice, such as a user with a nickname Back
    // pr for this reason, substitute the text, since the event Back already worked
    msg.text = item

    // If there are no child partitions
    if (!path.children) {
      return path
    } else {
      if (path.children.hasOwnProperty(item)) {
        return path.children[item]
      } else {
        // If there is no suitable branch, then we try to use a common branch
        if (path.children.hasOwnProperty('*')) {
          return path.children['*']
        } else {
          return path
        }
      }
    }
  }, map)

  // Call the event
  event.emit(reducer.event, msg, reducer)
})

// Go to Main page
event.on('location:home', msg => {
  state[msg.from.id] = []
  event.emit('location:back', msg)
})

// Main Menu
event.on('home', (msg, action, next) => {
  send.keyboard(msg.from.id, 'Выберите действие', action, 2)
  next && next()
})

// We export an event object
exports.event = event

// And also the state
exports.state = state
