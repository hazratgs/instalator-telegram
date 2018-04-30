const Model = require('../models/task')

// Add assignment
exports.create = async data => new Model.Task(data).save()

// assignment Laik + Subscription
exports.createFollowLike = async data => {
  const date = new Date()
  const minute = date.getMinutes()

  this.create({
    user: data.user,
    login: data.login,
    type: data.type,
    start: minute,
    params: {
      sourceType: data.sourceType, // source type
      source: data.source, // a source
      actionFollow: data.action, // number of subscriptions
      actionFollowDay: data.actionDay, // number of in a day
      actionLikeDay: data.like, // number of likes in a day,
      following: [] // who subscribed
    }
  })
}
   

// assignment
exports.createUnFollow = async data =>
  this.create({
    user: data.user,
    login: data.login,
    type: data.type,
    params: {
      following: [], // subscription from which you must unsubscribe
      unFollowing: [], // list of users who were unsubscribed from this task
      actionFollowingDay: data.actionFollowingDay // number of notes per day
    }
  })

// User Task List
exports.list = async user => Model.Task.find({ user: user })

// Current account job
exports.current = async (user, login) =>
  Model.Task.findOne({
    user: user,
    login: login,
    status: 'active'
  })

// Active quests
exports.currentList = async () => {
  const date = new Date()
  const minute = date.getMinutes()
  return Model.Task.find({
    status: 'active',
    start: minute
  })
}

// Completion of the assignment
exports.finish = async id =>
  Model.Task.update(
    {
      _id: id
    },
    {
      $set: {
        status: 'success'
      }
    }
  )

// Cancel a job
exports.cancel = async id =>
  Model.Task.update(
    {
      _id: id
    },
    {
      $set: {
        status: 'cancel'
      }
    }
  )

// Update subscription list
exports.followingUpdate = async (id, data) =>
  Model.Task.update(
    {
      _id: id
    },
    {
      $set: {
        'params.following': data
      }
    }
  )

// Add user to account
exports.unFollowAddUser = async (id, user) =>
  Model.Task.update(
    {
      _id: id
    },
    {
      $push: {
        'params.unFollowing': user
      }
    }
  )

// Remove user from account
exports.removeUnFollowUser = async (id, user) =>
  Model.Task.update(
    {
      _id: id
    },
    {
      $pull: {
        'params.following': user
      }
    }
  )

// Add a user to subscriptions
exports.addUserFollow = async (id, user) =>
  await Model.Task.update(
    {
      _id: id
    },
    {
      $push: {
        'params.following': user
      }
    }
  )

// Subscriber increment
exports.currentIncrement = async (user, login) =>
  Model.Task.update(
    {
      user: user,
      login: login
    },
    {
      $inc: {
        current: 1
      }
    }
  )

// Increment of likes
exports.likeIncrement = async (user, login) =>
  Model.Task.update(
    {
      user: user,
      login: login
    },
    {
      $inc: {
        likeCurrent: 1
      }
    }
  )

// Update count. notes per day
exports.updateActionDayUnFollowing = async (id, data) =>
  Model.Task.update(
    {
      _id: id
    },
    {
      $set: {
        'params.actionFollowingDay': data
      }
    }
  )

exports.updateActionsFollowing = async (id, data) => 
  Model.Task.update(
    {
      _id: id
    },
    {
      $set: {
        'params.actionFollow': data.actionFollow,
        'params.actionFollowDay': data.actionFollowDay,
        'params.actionLikeDay': data.actionLikeDay
      }
    }
  )
// Change the number of subscriptions
exports.changeCount = async (id, count) =>
  Model.Task.findByIdAndUpdate(id, {
    $set: {
      'params.actionFollow': count
    }
  })
