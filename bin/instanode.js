const Client = require('instagram-private-api').V1;

// Авторизация
exports.auth = (login, password) => {
    const device = new Client.Device(login);
    const storage = new Client.CookieFileStorage(`./bin/cookies/${login}.txt`);

    return Client.Session.create(device, storage, login, password)
};