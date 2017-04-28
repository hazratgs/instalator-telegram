const Client = require('instagram-private-api').V1;

const Account = require('../app/controllers/account');
const Source = require('../app/controllers/source');

// Авторизация
exports.auth = (login, password) => {
    const device = new Client.Device(login);
    const storage = new Client.CookieFileStorage(`./bin/cookies/${login}.txt`);

    return Client.Session.create(device, storage, login, password)
};

// Задание подписаться + лайк
exports.followLike = async (task) => {
    let account, session, source;

    // Поиск данных аккаунта
    await Account.contains(task.user, task.login)
        .then(res => account = res);

    // Поиск источника
    await Source.contains(task.source)
        .then(res => source = res);

    // Авторизовываемся в системе и получаем сессию
    // await this.auth(account.login, account.password)
    //     .then((res) => {
    //         session = res
    //     });
};

// Получить подписчиков аккаунта
exports.followLoad = async (login, password) => {
    return this.auth(login, password)
        .then(async (session) => {

            let followers = [];

            // Получаем данные пользователя
            let account = await Client.Account.searchForUser(session, login);

            // Запрашиваем подписчиков
            let feed = await new Client.Feed.AccountFollowing(session, account._params.id, 7500);

            // Сохраняем подписчиков
            await feed.all().then((result) => {
                followers = result;
            });

            return followers;
        });
};