const User = require('../../app/controllers/user');

module.exports = (data) => {
    return new Promise ((resolve, reject) => {

        // Поиск пользователя
        User.contains(data.id)
            .then(user => {
                if (user.length){
                    resolve(true)
                } else {

                    // Новый пользователь
                    User.create({id: data.id, name: data.name})
                        .then(() => resolve(false));
                }
            })
    })
};