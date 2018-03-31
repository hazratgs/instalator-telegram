const fs = require('fs')
const path = require('path')
const Model = require('../models/account')

// Список аккаунтов
exports.list = user => Model.Account.find({ user: user })

// Добавление аккаунта
exports.add = (user, login, password) =>
  new Model.Account({
    user: user,
    login: login.toLowerCase(),
    password: password
  }).save()

// Проверка существование аккаунта
exports.contains = (user, login) =>
  Model.Account.findOne({ user: user, login: login })

// Проверка существование аккаунта у всех пользователей
exports.containsAllUsers = login => Model.Account.find({ login: login })

// Удаление аккаунта
exports.remove = async (user, login) => {
  try {
    // Очистка cookies аккаунта
    fs.unlink(path.resolve('.', './bin/cookies') + `/${login}.txt`, err => {
      if (err) {
        throw new Error(err)
      }
    })
    return Model.Account.remove({ user: user, login: login })
  } catch (e) {
    return e
  }
}

// Записать информацию о подписке
exports.following = async (user, login, follow) => {
  try {
    let check = await this.checkFollowing(user, login, follow)
    if (check === null) {
      throw new Error(`Пользователь ${login} не подписан к ${follow}`)
    }
    return check
  } catch (e) {
    return this.addFollowing(user, login, follow)
  }
}

// Проверить подписку
exports.checkFollowing = (user, login, follow) =>
  Model.AccountFollow.findOne({
    user: user,
    login: login,
    data: {
      $in: [follow]
    }
  })

// Добавить подписчика в историю
exports.addFollowing = async (user, login, follow) => {
  try {
    let list = await this.followList(user, login)
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
    // Создаем базу для хранения подписок
    return new Model.AccountFollow({
      user: user,
      login: login,
      data: follow
    }).save()
  }
}

// Список подписок пользователя
exports.followList = (user, login) =>
  Model.AccountFollow.findOne({
    user: user,
    login: login
  })

// Очистить список подписчиков
exports.followClear = (user, login) =>
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

// Записать информацию о лайке
exports.like = (user, login, like) => {
  try {
    let check = this.checkLike(user, login, like)
    if (check === null) throw new Error(`${login} не лайкал ранее ${like}`)

    return check
  } catch (e) {
    // Ставим лайк
    return this.addLike(user, login, like)
  }
}

// Проверить, лайкнул ли
exports.checkLike = (user, login, like) =>
  Model.AccountLike.findOne({
    user: user,
    login: login,
    data: {
      $in: [like]
    }
  })

// Добавить подписчика лайк
exports.addLike = async (user, login, like) => {
  try {
    let list = await this.likeList(user, login)
    if (list === null) {
      throw new Error(
        `База данных AccountLike отсутствует для пользователя ${login}`
      )
    }

    // Записываем информацию о лайке
    return Model.AccountLike.update(
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
    // Запись не найдена, создаем документ
    return new Model.AccountLike({
      user: user,
      login: login,
      data: like
    }).save()
  }
}

// Список лайков пользователя
exports.likeList = (user, login) =>
  Model.AccountLike.findOne({
    user: user,
    login: login
  })
