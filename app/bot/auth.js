const User = require(process.cwd() + '/app/controllers/user');

module.exports = (data, callback) => {
    let auth = new Promise ((resolve, reject) => {
        User.contains(data.id, function (err, user) {

            /* Поиск пользователя */
            if (user.length){
                resolve(user);
            } else {
                reject();
            }
        });
    }).then((user) => {

        /* Пользователь существует */
        callback(user, false);

    }, () => {

        /* Новый пользователь */
        User.create({
            id: data.id,
            name: data.name
        }, (err, model) => {

            /* Зарегистрировали нового пользователя */
            callback(model, true);
        })
    });
};