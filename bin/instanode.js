const Client = require('instagram-private-api').V1;

// Авторизация
exports.auth = (login, password) => {
    const device = new Client.Device(login);
    const storage = new Client.CookieFileStorage(`./bin/cookies/${login}.txt`);

    return Client.Session.create(device, storage, login, password)
};

// Получить подписчиков аккаунта
exports.followLoad = async (login, password) => {

    let followers = [];

    // Авторизация
    await this.auth(login, password)
        .then(async (session) => {

            // Получаем данные пользователя
            let account = await Client.Account.searchForUser(session, login);

            // Запрашиваем подписчиков
            let feed = await new Client.Feed.AccountFollowing(session, account._params.id, 7500);

            feed.all().then((result) => {
                console.log(result.length)
            })
        });

};