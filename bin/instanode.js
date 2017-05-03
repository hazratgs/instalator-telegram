const Client = require('instagram-private-api').V1;

const Account = require('../app/controllers/account');
const Source = require('../app/controllers/source');
const Task = require('../app/controllers/task');

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
            .then(result => account = result);

        // Авторизация
        await this.auth(account.login, account.password)
            .then(result => {
                session = result
            });

        switch (task.params.sourceType){
            case 'Источники':
                this.followLikeSource(task, session, account);
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
        let source, action, time, id, following;

        id = task._id.toString();

        // Поиск источника
        await Source.contains(task.params.source)
            .then(res => source = res);

        // Список подписок
        following = task.params.following;

        // Кол. подписок в час
        action = task.params.actionFollowDay / 24;

        // Время на выполнения задания
        time = (3000 / action) * 25; // 1000

        // Поиск уникальных пользователей, для подписки
        let users = [];
        for (let user of source.source.reverse()){
            if (following.includes(user)) continue;

            let used;
            await Account.checkFollowing(account.user, account.login, user)
                .then(() => used = true)
                .catch(() => used = false);

            if (used) continue;
            if (users.length >= action) break;

            users.push(user);

            // Добавляем пользователя в временную базу подписок
            following.push(user);
        }

        if (!users.length){

            // Задача завершена
            Task.finish(id)
                .then(() => {
                    resolve(true);
                })
        } else {

            let ff = 0;
            // асинхронный итератор "якобии"
            let func = async (user) => {
                return new Promise(async (_resolve, _reject) => {
                    setTimeout(() => {
                        this.getFollow(session, user)
                            .then((relationship) => {

                                // фиксируем пользователя
                                if (relationship._params.following || relationship._params.outgoingRequest){

                                    // добавить в task.params свойства для хранения выполненых подписок в задании
                                    Task.addUserFollow(id, user)
                                        .then(() => {

                                            // Добавляем в базу подписок пользователей из отписок
                                            // чтобы в будущем повторно на них не подписаться
                                            Account.following(task.user, task.login, user)
                                                .then(() => {})
                                                .catch(() => {});

                                            ff++;
                                            _resolve()
                                            // Получаем данные для лайка
                                            // this.getContentForLike(session, user)
                                            //     .then(res => {
                                            //         _resolve()
                                            //     })
                                            //     .catch(err => {
                                            //
                                            //     });

                                        })
                                        .catch(err => {

                                        })
                                } else {
                                    // Не подписались
                                    _reject();
                                }
                            })
                            .catch(err => {
                                _reject(err)
                            })
                    }, time);
                });
            };

            // Обход пользователй и подписка
            for (let user of users){
                await func(user)
                    .then(() => {
                        console.log('Подписались к ' + user)
                    })
                    .catch(async (err) => {

                        console.log('404 ' + user);

                        // Удаляем пользователя из базы
                        Source.removeUserSource(source.name, user);

                        // Пользователь не найден, необходимо вместо него,
                        // подставить другого
                        for (let user of source.source.reverse()){
                            if (following.includes(user)) continue;

                            let used;
                            await Account.checkFollowing(account.user, account.login, user)
                                .then(() => used = true)
                                .catch(() => used = false);
                            if (used) continue;

                            users.push(user);

                            // Добавляем пользователя в временную базу подписок
                            following.push(user);

                            console.log('Добавили нового ' + user);
                            break;
                        }

                    });
            }
            console.log(ff);
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
                        reject(err)
                    })
            })
            .catch(err => {
                reject(err); // Не найден пользователь
            });
    });
};

// Достаем контент для лайка
exports.getContentForLike = (session, user) => {
    return new Promise(async (resolve, reject) => {
        let account = await Client.Account.searchForUser(session, user);
        let feed = await new Client.Feed.UserMedia(session, account._params.id);

        // Сохраняем подписчиков
        feed.all()
            .then((result) => {
                let media = [];
                for (let item of result){
                    media.push(item._params.username)
                }
                resolve(media)
            })
            .catch(err => reject(err));
    });
};

// Задание отписаться
exports.unFollow = async (task) => {
    return new Promise (async (resolve, reject) => {
        let account, session, following, unFollowing, id;

        id = task._id.toString();

        // Поиск данных аккаунта
        await Account.contains(task.user, task.login)
            .then(result => {
                account = result
            });

        // Авторизация
        await this.auth(account.login, account.password)
            .then(result => {
                session = result
            });

        // Список пользователей, от которых надо отписаться
        following = task.params.following;

        // Список от которых уже отписались
        unFollowing = task.params.unFollowing;

        if (!following.length){

            // Загружаем список подписок
            await this.followLoad(session, account.login, account.password)
                .then(result => following = result);

            // попробывать реализовать повторный запрос подписок,
            // чтобы получить наибоелее полный список подписок

            // Сохраняем для переиспользования
            Task.followingUpdate(id, following)
                .then(() => {

                })
                .catch(err => {
                    // Возникла ошибка при сохранении
                    console.log(err)
                })
        }

        // Кол. отписок в час
        let action = task.params.actionFollowingDay / 24; // 20

        // Время на выполнения задания
        let time = (3000 / action) * 1000;

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
                                    // Не отписались
                                    _reject();
                                }
                            })
                            .catch(err => {
                                // обработка ошибок
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
        let id;
        await Client.Account.searchForUser(session, user)
            .then(res => {
                id = res._params.id.toString();
            })
            .catch(err => {
                reject(); // Не найден пользователь
            });

        Client.Relationship.destroy(session, id)
            .then(relationship => {
                resolve(relationship)
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