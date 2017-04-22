var fs = require('fs');
var page = require('webpage').create();
var system = require('system');

var path = fs.workingDirectory + '/';
var user = system.args[1];
var timeout = 3000;

page.viewportSize = {
    width: 375,
    height: 375
};
page.settings.userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.82 Safari/537.36';
page.settings.loadImages = false;

// Отсутствует cookies
if(phantom.cookies === ""){
    console.log('Отсутствуют cookies follow.js');
    phantom.exit();
}

console.log('success');
console.log('|');
console.log('https://www.instagram.com/p/BS25YGGAAjQ/' + Math.random());
console.log('https://www.instagram.com/p/BTEktADgyVt/' + Math.random());
phantom.exit();

page.open('https://www.instagram.com/'+ user +'/', function() {
    setTimeout(function () {

        // Кнопка подписки
        var follow = page.evaluate(function () {
            var button = document.querySelector('button._ah57t');

            if (button){

                // Если не подписан, то подписываемся
                if (button.innerHTML == 'Follow' || button.innerHTML == 'Подписаться'){

                    return {
                        x: button.getBoundingClientRect().left,
                        y: button.getBoundingClientRect().top,
                        element: button
                    }
                } else {

                    // Если подписаны, игнорируем
                    return button.innerHTML;
                }
            } else {

                // Профиль не существует
                return false;
            }
        });

        if (typeof follow == 'object'){

            // Подписываемся к пользователю
            page.sendEvent('click', follow.x, follow.y);

            setTimeout(function () {
                var test = page.evaluate(function () {
                    var button = document.querySelector('button._ah57t');
                    return button.innerHTML;
                });

                if (test == 'Подписки'
                    || test == 'Following'
                    || test == 'Запрос отправлен'
                    || test == 'Requested'
                ){
                    console.log('success');

                    // Обрабатываем фотографии
                    getLinkImages();

                } else {

                    setTimeout(function () {
                        var test_2 = page.evaluate(function () {
                            var button = document.querySelector('button._ah57t');
                            return button.innerHTML;
                        });

                        if (test_2 == 'Подписки'
                            || test_2 == 'Following'
                            || test_2 == 'Запрос отправлен'
                            || test_2 == 'Requested'
                        ){
                            console.log('success');
                        } else {
                            console.log('error follow');
                        }

                        // Обрабатываем фотографии
                        getLinkImages();

                    }, timeout);
                }

            }, timeout);

        } else if (typeof follow == 'string'){

            // Скорее всего мы уже подписаны на пользователя
            console.log('following');

            // Обрабатываем фотографии
            getLinkImages();
        } else {

            // Кнопки нет, видимо нет страницы
            console.log(404);
            phantom.exit();
        }
    }, timeout);
});

function getLinkImages() {
    var photos = page.evaluate(function () {
        var links = document.querySelectorAll('a._8mlbc');

        // У пользователя нет фотографий || закрытый аккаунт
        if (!links.length){
            return false;
        }

        // Нам нужно не больше 3х фотографий
        var data = [];
        for (var i = 0; i < links.length; i++){
            if (i == 3) break;
            data.push(links[i].href);
        }

        return data;
    });

    if (photos.length){
        console.log('|');

        photos.forEach(function (item) {
            console.log(item);
        });
    }
}
