const fs = require('fs')
const path = require('path')
const Model = require('../models/account')
const Task = require('../models/task')

// List of accounts
exports.list = async user => Model.Account.find({ user: user })

// Adding an account
exports.add = async (user, login, password) =>
  new Model.Account({
    user: user,
    login: login.toLowerCase(),
    password: password
  }).save()

// Checking the existence of an account
exports.contains = async (user, login) =>
  Model.Account.findOne({ user: user, login: login })

// Verify the existence of the account for all users
exports.containsAllUsers = async login => await Model.Account.find({ login: login })

// Account deleting
exports.remove = async (user, login) => {
  try {
    // Clearing Account Cookies
    await fs.unlink(path.resolve('.', './cookies') + `/${login}.txt`)
    return Model.Account.remove({ user: user, login: login })
  } catch (e) {
    return e
  }
}

// Record subscription information
exports.following = async (user, login, follow) => {
  try {
    const check = await this.checkFollowing(user, login, follow)
    if (check === null) {
      throw new Error(`Пользователь ${login} не подписан к ${follow}`)
    }
    return check
  } catch (e) {
    return this.addFollowing(user, login, follow)
  }
}

// Check subscription
exports.checkFollowing = async (user, login, follow) =>
  Model.AccountFollow.findOne({
    user: user,
    login: login,
    data: {
      $in: [follow]
    }
  })

// Add a subscriber to the story
exports.addFollowing = async (user, login, follow) => {
  try {
    const list = await this.followList(user, login)
    if (list === null) throw new Error(`AccountFollow отсутствует для ${login}`)
    return Model.AccountFollow.update(
      {
        user: user,
        login: login
      },
      {
        $push: { data: follow }
      }
    )
  } catch (e) {
    // Create a database for storing subscriptions
    return new Model.AccountFollow({
      user: user,
      login: login,
      data: follow
    }).save()
  }
}

// List of user's subscriptions
exports.followList = async (user, login) =>
  Model.AccountFollow.findOne({
    user: user,
    login: login
  })

// Clear subscriber list
exports.followClear = async (user, login) =>
  Model.AccountFollow.update(
    {
      user: user,
      login: login
    },
    {
      $set: {
        data: []
      }
    }
  )

// Record information about the dog
exports.like = async (user, login, like) => {
  try {
    const check = this.checkLike(user, login, like)
    if (check === null) throw new Error(`${login} не лайкал ранее ${like}`)

    return check
  } catch (e) {
    // Ставим лайк
    return this.addLike(user, login, like)
  }
}

// Check whether it licked
exports.checkLike = async (user, login, like) =>
  await Model.AccountLike.findOne({
    user: user,
    login: login,
    data: {
      $in: [like]
    }
  })

// Add Subscriber like
exports.addLike = async (user, login, like) => {
  try {
    let list = await this.likeList(user, login)
    if (list === null) {
      throw new Error(
        `База данных AccountLike отсутствует для пользователя ${login}`
      )
    }

    // We record information about the husky
    return await Model.AccountLike.update(
      {
        user: user,
        login: login
      },
      {
        $push: {
          data: like
        }
      }
    )
  } catch (e) {
    // The record was not found, we are creating a document
    return new Model.AccountLike({
      user: user,
      login: login,
      data: like
    }).save()
  }
}

// User List List
exports.likeList = async (user, login) =>
  Model.AccountLike.findOne({
    user: user,
    login: login
  })

// Method for editing login / password
exports.changeAccount = async (user, login, newLogin, newPassword) => {
  await Model.Account.update(
    {
      user: user,
      login: login
    },
    {
      $set: {
        login: newLogin,
        password: newPassword
      }
    },
    {
      multi: true
    }
  )

  await Model.AccountFollow.update(
    {
      user: user,
      login: login
    },
    {
      $set: {
        login: newLogin
      }
    },
    {
      multi: true
    }
  )

  await Model.AccountLike.update(
    {
      user: user,
      login: login
    },
    {
      $set: {
        login: newLogin
      }
    },
    {
      multi: true
    }
  )

  await Task.Task.update(
    {
      user: user,
      login: login
    },
    {
      $set: {
        login: newLogin
      }
    },
    {
      multi: true
    }
  )
}
