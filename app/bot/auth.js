const User = require('../../app/controllers/user');

module.exports = (data, callback) => {
    new Promise ((resolve, reject) => {

        // Поиск пользователя
        User.contains(data.id, (err, user) =>
            user.length
                ? resolve(user)
                : reject()
        )
    })

        // Пользователь зарегистрирован
        .then((user) => callback(true))

        // Новый пользователь
        .catch(() => User.create({
            id: data.id,
            name: data.name
        }, () => callback(false)));
};