const Client = require('instagram-private-api').V1
const bot = require('../telegram')
const send = require('./send')

const Account = require('./controllers/account')
const Source = require('./controllers/source')
const Task = require('./controllers/task')

function random (min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1)
  rand = Math.round(rand)
  return rand
}

// Execution postponing
function sleep (time) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

// Authorization
exports.auth = (login, password) => {
  const device = new Client.Device(login)
  const storage = new Client.CookieFileStorage(`./cookies/${login}.txt`)

  return Client.Session.create(device, storage, login, password)
}

// Assign to subscribe + like
exports.followLike = async task => {
  try {
    const account = await Account.contains(task.user, task.login)
    if (!account) {
      // remove task if don't not account
      await Task.cancel(task._id)
      send.message(
        task.user,
        `Аккаунт ${task.login} не найден, задача ${task.type} отменена!`
      )
      throw new Error('empty account')
    }
    const session = await this.auth(account.login, account.password)

    switch (task.params.sourceType) {
      case 'Источники':
        return await this.followLikeSource(task, session, account)

      case 'Пользователь':
        return await this.sourceConstructor(task, session, account)

      case 'Хештег':
        return await this.sourceConstructor(task, session, account, 3600000)

      default:
        throw new Error(
          'Нет подходящего обработчика для: ' + task.params.sourceType
        )
        break
    }
  } catch (err) {
    return err
  }
}

// Subscription + like from the source user
exports.sourceConstructor = async (
  task,
  session,
  account,
  time = 7776000000
) => {
  try {
    const source = await Source.contains(task.params.source)
    if (!source || !source.source.length) {
      throw new Error('Источник не существует')
    }

    // At the end of the period, we reset the cache
    if (+source.date + time < Date.now()) {
      await Source.remove(task.params.source)
      throw new Error('Срок годности базы истек')
    }
  } catch (e) {
    // Download source
    const source = task.params.sourceType === 'Пользователь'
      ? await this.getAccountFollowers(session, task.params.source)
      : task.params.sourceType === 'Хештег'
          ? await this.getHashFollowers(session, task.params.source)
          : []

    await Source.create({ name: task.params.source, source: source })

    // If the number of subscribers is less than the number specified in the task,
    // we update the number of subscribers
    if (source.length < task.params.actionFollow) {
      await Task.changeCount(task._id, source.length)
    }
  }

  // Run the task
  await this.followLikeSource(task, session, account)
}

// subscription + like from the source
exports.followLikeSource = async (task, session, account) => {
  try {
    const id = task._id.toString()

    // Source search
    const source = await Source.contains(task.params.source)

    // List of Subscriptions
    const following = task.params.following

    // Qty. subscriptions per hour
    const action = Math.round(task.params.actionFollowDay / 24)

    // Array of users to bypass
    const users = []

    // Search for unique users, to subscribe
    const findUsers = async (limit = false) => {
      for (let user of source.source) {
        if (following.includes(user)) continue

        // Earlier signed, if so, passes
        let used = true
        try {
          const status = await Account.checkFollowing(
            account.user,
            account.login,
            user
          )
          if (!status) throw new Error('empty')
        } catch (e) {
          used = false
        }

        if (used) continue
        if (limit && users.length === limit) break

        // Add to user array
        users.push(user)

        // Adding a user to the temporary subscription database
        following.push(user)

        // If there is no limit, then the sample of 1 user
        if (!limit) break
      }
    }

    await findUsers(action)

    // If more users are not present from the task, then complete the task
    // Or overfulfilled the plan
    if (!users.length || following.length >= task.params.actionFollow) {
      console.log(
        'Задача остановлена',
        users,
        following,
        task.params.actionFollow
      )
      Task.finish(id)
      return true
    }

    // User bypass and subscription
    for (let user of users) {
      try {
        // User search
        const searchUser = await Client.Account.searchForUser(session, user)

        const time = Math.round(3000 / action * random(50, 1000))
        await sleep(time)

        let relationship = await this.getFollow(session, searchUser)
        if (
          relationship._params.following ||
          relationship._params.outgoingRequest ||
          searchUser.params.friendshipStatus.is_private
        ) {
          // Fix subscription
          Task.addUserFollow(id, user)
          Account.following(task.user, task.login, user)

          // We put like
          await this.getLike(
            session,
            task.user,
            task.login,
            searchUser,
            task.params.actionLikeDay
          )
        }
      } catch (err) {
        // The limit has worked, we stop the task
        if (err.name === 'RequestsLimitError') {
          bot.sendMessage(
            task.user,
            '⛔️ Instagram предупредил о превышении лимита, пожалуйста уменьшите количество действий в день'
          )
          break
        }

        if (err.name === 'IGAccountNotFoundError') {
          // We delete the user from the database
          Source.removeUserSource(source.name, user)
          console.log(`Удалили пользователя ${user}`)

          // User is not found, you need to replace it,
          // substitute another
          await findUsers()
        }

        if (err.name === 'ParseError') {
          bot.sendMessage(
            task.user,
            '⛔️ Instagram предупредил о превышении лимита, пожалуйста уменьшите количество действий в день'
          )
          break
        }
      }
    }

    return false
  } catch (err) {
    console.log(err)
  }
}

// Subscription
exports.getFollow = async (session, account) => {
  return Client.Relationship.create(session, account._params.id.toString())
}

// We get content for the husk
exports.getLike = async (session, user, login, account, limit = 1) => {
  try {
    let feed = await new Client.Feed.UserMedia(
      session,
      account._params.id,
      limit
    )
    let media = await feed.get()

    let i = 0
    for (let item of media) {
      if (limit == i) break

      let used = true
      try {
        const checkLink = await Account.checkLike(user, login, item._params.id)
        if (!checkLink) throw new Error('База отсутствует')
      } catch (e) {
        used = false
      }

      // We skip the previously bumped
      if (used) continue

      // Installation of husk
      await new Client.Like.create(session, item._params.id)

      // We record information about the husky
      Account.like(user, login, item._params.id)

      i++
    }
  } catch (err) {
    return err
  }
}

// Unsigned job
exports.unFollow = async task => {
  try {
    const id = task._id.toString()

    // Finding account information
    const account = await Account.contains(task.user, task.login)

    // Authorization
    const session = await this.auth(account.login, account.password)

    // List of users to unsubscribe from
    let following = task.params.following

    // List from which already unsubscribed
    let unFollowing = task.params.unFollowing

    if (!following.length) {
      // Download the list of subscriptions
      following = await this.followLoad(
        session,
        account.login,
        account.password
      )

      // try to implement a repeated request for subscriptions,
      // to get the most complete list of subscriptions

      // We save for re-use
      Task.followingUpdate(id, following)
    }

    // Qty. unsubscribe per hour
    let action = Math.round(task.params.actionFollowingDay / 24)

    // Keep users for unsubscribing
    let users = []

    // Search for unique users to unsubscribe
    let findUsers = (limit = false) => {
      for (let user of following) {
        if (unFollowing.includes(user)) continue
        if (limit && users.length === limit) break

        // Add to user array
        users.push(user)

        // We add the user to the temporary database from the subscriptions,
        // thus skipping the deleted accounts
        unFollowing.push(user)

        if (!limit) break
      }
    }

    findUsers(action)

    // If there are no more subscribers, we finish the task
    if (!users.length) {
      await Task.finish(id)
      return true
    }

    // User bypass and unsubscription
    for (let user of users) {
      try {
        // User search
        let searchUser = await Client.Account.searchForUser(session, user)

        let time = Math.round(3000 / action * random(50, 1000))
        await sleep(time)

        let relationship = await this.getUnFollow(session, searchUser)
        if (!relationship._params.following) {
          // We fix the user
          Task.unFollowAddUser(id, user)

          // We add subscriptions of users from the subscriptions to the database
          // so that in the future they do not have to subscribe again
          Account.following(task.user, task.login, user)
        }
      } catch (err) {
        // Delete an existing account from the list of notifications
        if (err.name === 'IGAccountNotFoundError') {
          Task.removeUnFollowUser(id, user)
        }

        // Looking for a replacement
        findUsers()
      }
    }

    return false
  } catch (err) {
    return err
  }
}

// Unsubscription
exports.getUnFollow = async (session, user) => {
  return Client.Relationship.destroy(session, user._params.id.toString())
}

// Get account subscribers
exports.followLoad = async (session, login) => {
  try {
    const account = await Client.Account.searchForUser(session, login)
    const feed = await new Client.Feed.AccountFollowing(
      session,
      account._params.id
    )

    // Save subscribers
    let allFollowing = await feed.all()

    let following = []
    for (let item of allFollowing) {
      following.push(item._params.username)
    }
    return following
  } catch (err) {
    return `Ошибка при загрузки подписчиков для пользователя ${login}: ${err}`
  }
}

// Downloading the list of subscribers for the group
exports.getAccountFollowers = async (session, login) => {
  try {
    const account = await Client.Account.searchForUser(session, login)
    const feeds = await new Client.Feed.AccountFollowers(
      session,
      account._params.id
    )
    const data = await feeds.all({ maxErrors: 300 })
    const users = data.map(item => item._params.username)

    return users
  } catch (e) {
    console.log(e)
    return []
  }
}

// User search
exports.searchUser = async (session, user) =>
  await Client.Account.searchForUser(session, user)

exports.getHashFollowers = async (session, tag) => {
  try {
    const tags = await new Client.Feed.TaggedMedia(session, tag.substr(1))
    const data = await tags.all({ limit: 15000, maxErrors: 999999 })

    const users = data.map(item => item.params.account.username)
    const uniqUsers = [...new Set(users)]

    return uniqUsers
  } catch (e) {
    return []
  }
}

exports.infoHashtag = async (session, tag) =>
  await new Client.Hashtag.info(session, tag)
