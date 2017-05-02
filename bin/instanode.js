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
        let account, session, source;

        // Поиск данных аккаунта
        await Account.contains(task.user, task.login)
            .then(res => account = res);

        // Поиск источника
        await Source.contains(task.source)
            .then(res => source = res);
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
exports.getUnFollow = (session, account) => {
    return new Promise((resolve, reject) => {
        Client.Relationship.destroy(session, account)
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
                    following.push(item.id.toString())
                }
                resolve(following)
            })
            .catch(err => reject(err));
    });
};

// this.auth('halicha.ru', '475787093w')
//     .then(async session => {
//
//         // Получаем данные пользователя
//         let account = await Client.Account.searchForUser(session, 'myderbent_plus');
//
//         // Запрашиваем подписчиков
//         let feeds = await new Client.Feed.AccountFollowers(session, account._params.id, 400);
//
//         feeds.get()
//             .then(res => {
//                 let followers = [];
//                 for (let item of res){
//                     followers.push(item._params.id.toString());
//                 }
//                 console.log(followers.length)
//             })
//
//     });