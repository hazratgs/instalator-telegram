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

exports.auths = (login, password, callback) => {
    callback(null, 'success', null);
};

// Запуск подписа+лайк
exports.follow = (task, account, source, callback) => {

    // Account.followClear(account.user, account.login, (err) => {
    //     console.log('Очищено')
    // });
    // return false;

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
        this.auths(account.login, account.password, (error, stdout, stderr) => {
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
                                    switch (result.trim()){

                                        // Успешно подписались
                                        case 'success':
                                            Account.follow(account.user, account.login, item, (err, result) => {
                                                newFollow++;

                                                // Инкримент
                                                Task.currentIncrement(account.user, account.login, (err) => {
                                                    if (!err){

                                                        // Задача выполнена, переходи к другому пользователю
                                                        resolve(true);
                                                    }
                                                });
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
                                            break;

                                        // Не предвиденная ошибка
                                        default:
                                            resolve(false);
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