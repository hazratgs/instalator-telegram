const User = require('../../app/controllers/user');

module.exports = (data) => {
    return new Promise ((resolve, reject) => {

        // Поиск пользователя
        User.contains(data.id)
            .then(user => {
                if (user.length){
                    resolve()
                } else {

                    // Новый пользователь
                    User.create({id: data.id, name: data.name})
                        .then(() => reject());
                }
            })
    })
};