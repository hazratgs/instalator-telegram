const log = require('../libs/log')(module);
const Client = require('instagram-private-api').V1;

const Account = require('../app/controllers/account');
const Source = require('../app/controllers/source');
const Task = require('../app/controllers/task');

function random(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
}

// Авторизация
exports.auth = (login, password) => {
    const device = new Client.Device(login);
    const storage = new Client.CookieFileStorage(`./bin/cookies/${login}.txt`);

    return Client.Session.create(device, storage, login, password)
};

// Задание подписаться + лайк
exports.followLike = (task) => {
    return new Promise(async (resolve, reject) => {
        let account, session;

        // Поиск данных аккаунта
        await Account.contains(task.user, task.login)
            .then(result => account = result)
            .catch(err => log.error(err));

        // Авторизация
        await this.auth(account.login, account.password)
            .then(result => {
                session = result
            })
            .catch(err => log.error(err));

        switch (task.params.sourceType){
            case 'Источники':
                this.followLikeSource(task, session, account)
                    .then(() => resolve())
                    .catch((err) => reject());
                break;

            default:
                reject();
                break;
        }
    });
};

// подписка+лайк из источника
exports.followLikeSource = (task, session, account) => {
    return new Promise(async (resolve, reject) => {
        let id = task._id.toString();

        // Поиск источника
        let source = await Source.contains(task.params.source)
            .catch(err => {
                log.error(err);
                reject(err);
            });

        // Список подписок
        let following = task.params.following;

        // Кол. подписок в час
        let action = Math.round(task.params.actionFollowDay / 24);

        // Время на выполнения задания
        let time = (3000 / action) * random(100, 1000);

        // Массив пользователей для обхода
        let users = [];

        // Поиск уникальных пользователей, для подписки
        let findUsers = async (limit = false) => {
            for (let user of source.source){
                if (following.includes(user)) continue;

                let used;
                await Account.checkFollowing(account.user, account.login, user)
                    .then(() => used = true)
                    .catch(() => used = false);

                if (used) continue;
                if (limit && users.length === limit) break;

                // Добавляем в массив пользователей
                users.push(user);

                // Добавляем пользователя в временную базу подписок
                following.push(user);

                // Если нет лимита, то выборка 1 пользователя
                if (!limit) break;
            }
        };

        // Проверям, на выполнение задачи
        if (following >= task.params.actionFollow){

            // Задача завершена
            Task.finish(id)
                .then(() => {
                    resolve(true);
                })
        }

        await findUsers(action);

        // Если больше пользователей нет из задачи, то завершаем задание
        if (!users.length){

            // Задача завершена
            Task.finish(id)
                .then(() => {
                    resolve(true);
                })

        } else {

            // асинхронный итератор "якобии"
            let func = async (user) => {
                return new Promise(async (_resolve, _reject) => {
                    setTimeout(() => {
                        this.getFollow(session, user)
                            .then((relationship) => {

                                // фиксируем пользователя
                                if (relationship._params.following || relationship._params.outgoingRequest){
                                    Task.addUserFollow(id, user)
                                        .then(() => {

                                            // Добавляем в базу подписок пользователей из отписок
                                            // чтобы в будущем повторно на них не подписаться
                                            Account.following(task.user, task.login, user)
                                                .then(() => {})
                                                .catch(() => {});

                                            // Получаем данные для лайка
                                            this.getLike(session, task.user, task.login, user, task.params.actionLikeDay)
                                                .then(res => {
                                                    _resolve(); // поставили лайки
                                                })
                                                .catch(err => {
                                                    log.error(err);
                                                    _resolve(); // нет контента, ошибка
                                                });
                                        })
                                        .catch(err => {
                                            console.log(err)
                                        })
                                } else {
                                    // Не подписались
                                    _reject();
                                }
                            })
                            .catch(err => {
                                log.error(err);
                                _reject(err)
                            })
                    }, time);
                });
            };

            // Обход пользователй и подписка
            for (let user of users){
                await func(user)
                    .then(() => {
                        // Успещно подписались
                    })
                    .catch(async (err) => {

                        // Удаляем пользователя из базы
                        Source.removeUserSource(source.name, user);

                        // Пользователь не найден, необходимо вместо него,
                        // подставить другого
                        await findUsers();
                    });
            }
            resolve(false);
        }
    });
};

// Подписка
exports.getFollow = (session, user) => {
    return new Promise((resolve, reject) => {
        Client.Account.searchForUser(session, user)
            .then(res => {
                Client.Relationship.create(session, res._params.id.toString())
                    .then(relationship => {
                        resolve(relationship)
                    })
                    .catch(err => {
                        log.error(err);
                        reject(err)
                    })
            })
            .catch(err => {
                log.error(err);
                reject(err); // Не найден пользователь
            });
    });
};

// Достаем контент для лайка
exports.getLike = (session, user, login, like, limit = 1) => {
    return new Promise(async (resolve, reject) => {
        let account = await Client.Account.searchForUser(session, like)
            .catch(err => {
                reject(err);
            });

        let feed = await new Client.Feed.UserMedia(session, account._params.id, limit)
            .catch(err => {
                reject(err);
            });

        feed.get()
            .then(async (result) => {
                if (result.length){
                    let i = 0;
                    for (let item of result){
                        if (limit == i) break;

                        let used;
                        await Account.checkLike(user, login, item._params.id)
                            .then(() => used = true)
                            .catch(() => used = false);

                        // Пропускаем ранее лайкнутые
                        if (used) continue;

                        // Установка лайка
                        await new Client.Like.create(session, item._params.id)
                            .then((res) => {

                                // Записываем информацию о лайке
                                Account.like(user, login, item._params.id);
                            })
                            .catch((err) => {
                                log.error(err);
                            });
                        i++;
                    }
                    resolve();
                } else {
                    reject();
                }
            })
            .catch(err => {
                reject(err)
            });
    });
};

// Задание отписаться
exports.unFollow = async (task) => {
    return new Promise (async (resolve, reject) => {
        let id = task._id.toString();

        // Поиск данных аккаунта
        let account = await Account.contains(task.user, task.login)
            .catch(err => {
                log.error(err);
                reject(err);
            });

        // Авторизация
        let session = await this.auth(account.login, account.password)
            .catch(err => {
                log.error(err);
                reject(err)
            });

        // Список пользователей, от которых надо отписаться
        let following = task.params.following;

        // Список от которых уже отписались
        let unFollowing = task.params.unFollowing;

        if (!following.length){

            // Загружаем список подписок
            following = await this.followLoad(session, account.login, account.password)
                .catch(err => {
                    log.error(err);
                    reject(err);
                });

            // попробывать реализовать повторный запрос подписок,
            // чтобы получить наибоелее полный список подписок

            // Сохраняем для переиспользования
            Task.followingUpdate(id, following);
        }

        // Кол. отписок в час
        let action =  Math.round(task.params.actionFollowingDay / 24);

        // Время на выполнения задания
        let time = (3000 / action) * random(100, 1000);

        // Поиск уникальных пользователей, для отписки
        let users = [];
        for (let user of following){
            if (unFollowing.includes(user)) continue;
            if (users.length >= action) break;

            users.push(user);
        }

        if (!users.length){

            // Задача завершена
            Task.finish(id)
                .then(() => {
                    resolve(true);
                })
        } else {

            // асинхронный итератор "якобии"
            let func = async (user) => {
                return new Promise((_resolve, _reject) => {
                    setTimeout(() => {
                        this.getUnFollow(session, user)
                            .then((relationship) => {

                                // фиксируем пользователя
                                if (!relationship._params.following){
                                    Task.unFollowAddUser(id, user)
                                        .then(() => {

                                            // Добавляем в базу подписок пользователей из отписок
                                            // чтобы в будущем повторно на них не подписаться
                                            Account.following(task.user, task.login, user);

                                            _resolve()
                                        })
                                        .catch(err => {
                                            console.log(err)
                                        })
                                } else {
                                    _reject();
                                }
                            })
                            .catch(err => {
                                log.error(err);
                                _reject(err)
                            })
                    }, time);
                });
            };

            // Обход пользователй и отписка
            for (let user of users){
                await func(user)
            }
            resolve(false);
        }
    });
};

// Отписка
exports.getUnFollow = (session, user) => {
    return new Promise(async (resolve, reject) => {

        // Получаем данные пользователя
        let account = await Client.Account.searchForUser(session, user)
            .catch(err => {
                log.error(err);
                reject();
            });

        Client.Relationship.destroy(session, account._params.id.toString())
            .then(relationship => {
                resolve(relationship)
            })
            .catch(err => {
                log.error(err);
                reject();
            })
    });
};

// Получить подписчиков аккаунта
exports.followLoad = async (session, login) => {
    return new Promise(async(resolve, reject) => {

        // Получаем данные пользователя
        let account = await Client.Account.searchForUser(session, login);

        // Запрашиваем подписчиков
        let feed = await new Client.Feed.AccountFollowing(session, account._params.id);

        // Сохраняем подписчиков
        feed.all()
            .then((result) => {
                let following = [];
                for (let item of result){
                    following.push(item._params.username)
                }
                resolve(following)
            })
            .catch(err => reject(err));
    });
};