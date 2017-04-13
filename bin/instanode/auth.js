var page = require('webpage').create();
var system = require('system');

// Устанавливаем размер окна
page.viewportSize = {
    width: 375,
    height: 375
};

// Получаем логин, пароль через аргументы
var username = system.args[1];
var password = system.args[2];

// User-agent и отменяем загрузку изображений
page.settings.userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.82 Safari/537.36';
page.settings.loadImages = false;

// Таймаут
var timeout = 5000;

// Авторизуемся
page.open('https://www.instagram.com/accounts/login/', function() {
    setTimeout(function () {
        var inputs = page.evaluate(function () {
            var username = document.querySelector('input[name="username"]'),
                password = document.querySelector('input[name="password"]'),
                button = document.querySelector('button');

            // Если уже авторизовались с помощью cookies
            if (!username && !password) return false;

            return {
                username: {
                    element: username,
                    position: {
                        x: username.getBoundingClientRect().left,
                        y: username.getBoundingClientRect().top
                    }
                },
                password: {
                    element: password,
                    position: {
                        x: password.getBoundingClientRect().left,
                        y: password.getBoundingClientRect().top
                    }
                },
                button: {
                    element: button,
                    position: {
                        x: button.getBoundingClientRect().left,
                        y: button.getBoundingClientRect().top
                    }
                }
            }
        });

        // Форма есть, пытаемся авторизоваться
        if (inputs){

            // Вставка логина
            page.sendEvent('click', inputs.username.position.x, inputs.username.position.y);
            page.sendEvent('keypress', username);

            // Вставка пароля
            page.sendEvent('click', inputs.password.position.x, inputs.password.position.y);
            page.sendEvent('keypress', password);

            // Отправка формы
            page.sendEvent('click', inputs.button.position.x, inputs.button.position.y);

            // Ждем рендеринг страницы
            setTimeout(function () {

                // Проверка авторизации
                var error = page.evaluate(function () {
                    var element = document.getElementById('slfErrorAlert');
                    var error_message = false;
                    if (element !== null) {
                        error_message = element.innerText.trim();
                    }
                    return error_message;
                });

                if (!error) {
                    if(page.url=="https://www.instagram.com/") {

                        // Авторизация прошла успещно
                        console.log('success');
                        phantom.exit();

                    } else {
                        console.log('Ошибка авторизации '+ username +': ' + error);
                        phantom.clearCookies();
                        phantom.exit();
                    }
                } else {
                    console.log('Ошибка авторизации: ' + error);
                    phantom.exit();
                }

            }, timeout);
        } else {

            // Форма отсутствует, видимо мы авторизованы
            setTimeout(function(){
                if(page.url=="https://www.instagram.com/"){
                    console.log('success');
                    phantom.exit();
                }
            }, timeout);
        }
    }, timeout)
});