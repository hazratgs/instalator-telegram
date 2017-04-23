const exec = require("child_process").exec;
const dir = process.cwd();
const send = require('../../app/bot/method');

const Account = require('../../app/controllers/account');
const Task = require('../../app/controllers/task');

// Авторизация
exports.auth = (login, password, callback) => {
    return exec(`phantomjs --cookies-file=${dir}/bin/instanode/cookies/${login}.txt ${dir}/bin/instanode/auth.js ${login} ${password}`, (error, stdout, stderr) => {
        callback(error, stdout, stderr)
    });
};

// Запуск подписа+лайк
exports.follow = (task, account, source, callback) => {

    // Остаток действий
    let actionBalance = task.action - task.current;

    // Не все действия еще выполнены
    if (actionBalance){

        // Кол. действий, которые необходимо выполнить
        let actions = task.actionPerDay;

        // кол. новых подписок
        let newFollow = 0;

        // Задание не завершено
        let finish = false;

        // Последняя выполнение программы
        if ((actionBalance / task.actionPerDay) < 1){

            // Изменяем кол. действий на остаток
            actions = actionBalance;

            // Задание подходит к концу
            finish = true;
        }

        // Авторизация
        this.auth(account.login, account.password, (error, stdout, stderr) => {
            if (stdout === 'success'){
                const fetch = (item) => {
                    return new Promise((resolve, reject) => {

                        // Проверяем, подписывались ли ранее
                        Account.followCheck(account.user, account.login, item, (status) => {
                            if (!status){

                                // Подписываемся
                                let follow = new Promise((_resolve, _reject) => {
                                    exec(`phantomjs --cookies-file=${dir}/bin/instanode/cookies/${account.login}.txt ${dir}/bin/instanode/follow.js ${item}`, (error, stdout, stderr) => {
                                        _resolve(stdout);
                                    });
                                });

                                follow.then((result) => {

                                    // Ссылки на фотографии
                                    let link = [];

                                    // Ищем в выводе ссылки
                                    if (result.indexOf('|') !== -1){
                                        let param = result.split('|');

                                        // Сохраняем
                                        for (let item of param[1].split('\n')){
                                            if (item.trim() === '') continue;

                                            link.push(item.trim());
                                        }

                                        // Статус
                                        result = param[0].trim();
                                    }

                                    switch (result.trim()){

                                        // Успешно подписались
                                        case 'success':
                                            Account.follow(account.user, account.login, item, (err, result) => {
                                                newFollow++;

                                                // Инкримент
                                                Task.currentIncrement(account.user, account.login, (err) => {});

                                                if (link.length){
                                                    this.like(account.user, account.login, link, () => {

                                                        // Переход к следующему пользователю
                                                        resolve(true);
                                                    });
                                                } else {
                                                    resolve(true);
                                                }
                                            });
                                            break;

                                        // Подписаны ранее
                                        case 'following':
                                            break;

                                        // Ошибка, не возможно подписаться
                                        case 'error follow':
                                            break;

                                        // Нет такой страницы
                                        case 404:

                                            // В будушем, необходимо удалять такую страницу из источника
                                            break;

                                        // Не предвиденная ошибка
                                        default:

                                            // Отправлять ошибку разработчику
                                            // resolve(false);
                                            break;
                                    }
                                });

                            } else {

                                // Подписаны ранее, сохраняем информацию о подписке в базе
                                resolve(false);
                            }
                        });
                    });
                };

                (async () => {

                    // Синхронно перебираем все аккаунты из источника
                    for (let item of source){

                        // Выходим из перебора в случае максимума за 1 день
                        if (newFollow >= actions) break;

                        // Ожидаем завершения активности
                        await fetch(item);
                    }

                    // Если задание завершено
                    if (finish){
                        Task.finish(account.user, account.login, (err) => {
                            if (!err){
                                send.message(account.user, `Задание Лайк+Подписка успешно завершено для аккаунта ${account.login}`);
                            }
                        })
                    }
                })();
            } else {

                // Авторизация не прошла, необходимо оповестить пользователя
                send.message(account.user, `Возникла ошибка при выполнении задания для ${account.login}: ошибка авторизации, проверьте правильность логина/пароля`);
            }
        });

    } else {

        // Все действия выполнены, сохраняем информацию о завершении задачи
        Task.finish(account.user, account.login, (err) => {
            if (!err){
                send.message(account.user, `Задание Лайк+Подписка успешно завершено для аккаунта ${account.login}`);
            }
        })
    }
};

//
exports.like = async (user, login, link, callback) => {

    let like = (item) => {
        return new Promise((resolve, reject) => {

            // Проверяем, лайкали мы ранее фотографии
            Account.likeCheck(user, login, item, (status) => {
                if (!status){

                    // Лайкаем
                    let getLike = new Promise((_resolve, _reject) => {
                        exec(`phantomjs --cookies-file=${dir}/bin/instanode/cookies/${login}.txt ${dir}/bin/instanode/like.js ${item}`, (error, stdout, stderr) => {
                            _resolve(stdout.trim());
                        });
                    });

                    getLike.then((status) => {
                        if (status === 'success'){

                            // Успешно поставили лайк, записываем информацию в базе
                            Account.like(user, login, item, () => {

                                // Инкримент в задание
                                Task.likeIncrement(user, login, (err) => {
                                    resolve(true);
                                });
                            })

                        } else if (status === 'before'){

                            // Лайк был установлен ранее
                            resolve(false)

                        } else {

                            // Ошибка, почему то не удалось подписаться
                            resolve(false)
                        }
                    });
                } else {

                    // Был лайкнут ранее
                    resolve(false)
                }
            });
        });
    };

    for (let item of link){

        // Запускаем процесс
        await like(item);
    }

    callback();
};