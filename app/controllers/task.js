const Model = require('../models/task')

// Добавить задание
exports.create = async data => new Model.Task(data).save()

// задание Лайк+Подписка
exports.createFollowLike = async data =>
  this.create({
    user: data.user,
    login: data.login,
    type: data.type,
    params: {
      sourceType: data.sourceType, // тип источника
      source: data.source, // источник
      actionFollow: data.action, // кол. подписок необходимо выполнить
      actionFollowDay: data.actionDay, // кол. в день
      actionLikeDay: data.like, // кол. лайков в день,
      following: [] // на кого подписались
    }
  })

// задание Отписка
exports.createUnFollow = async data =>
  this.create({
    user: data.user,
    login: data.login,
    type: data.type,
    params: {
      following: [], // подписки, от которых надо отписаться
      unFollowing: [], // список пользователей, от которых в этом задании отписались
      actionFollowingDay: data.actionFollowingDay // кол. отписок в день
    }
  })

// Список задач пользователя
exports.list = async user => Model.Task.find({ user: user })

// Текущее задание аккаунта
exports.current = async (user, login) =>
  Model.Task.findOne({
    user: user,
    login: login,
    status: 'active'
  })

// Активные задания
exports.currentList = async () =>
  Model.Task.find({
    status: 'active'
  })

// Завершение задания
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

// Отмена задания
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

// Обновить список подписок
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

// Добавить пользователя в отписки
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

// Удалить пользователя из отписки
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

// Добавить пользователя в подписки
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

// Инкримент подписчиков
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

// Инкримент лайков
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

// Обновить кол. отписок в день
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

// Изменить количество подписок
exports.changeCount = async (id, count) =>
  Model.Task.findByIdAndUpdate(id, {
    $set: {
      'params.actionFollow': count
    }
  })
