var fs = require('fs');
var page = require('webpage').create();
var system = require('system');

page.viewportSize = {
    width: 375,
    height: 375
};
page.settings.userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.82 Safari/537.36';
page.settings.loadImages = false;

// Отсутствует cookies
if(phantom.cookies == ""){
    console.log('Отсутствуют cookies like.js');
    phantom.exit();
}

var link = system.args[1];
var timeout = 2000;

console.log('success');
phantom.exit();

page.open(link, function() {
    setTimeout(function () {
        var like = page.evaluate(function () {
            var button = document.querySelector('._ebwb5');

            // Лайк был установлен ранее
            if (button.innerText.replace(/\s*$/,'') == 'Не нравится' || button.innerText.replace(/\s*$/,'') == 'Unlike'){
                return false;
            } else {

                // Лайк не был установлен ранее
                var event = document.createEvent('Events');
                event.initEvent('click', true, false);
                button.dispatchEvent(event);
            }
            return true;
        });

        setTimeout(function () {

            if (like) {

                // Проверяем лайк
                var test = page.evaluate(function () {
                    var button = document.querySelector('._ebwb5');

                    if (button.innerText.replace(/\s*$/,'') == 'Не нравится' || button.innerText.replace(/\s*$/,'') == 'Unlike'){
                        return true;
                    }
                    return false;
                });

                if (test) {

                    // Успешно
                    console.log('success');
                } else {

                    // Возникла ошибка!
                    console.log('error');
                }

            } else {
                console.log('before');
            }

            // Убиваем процесс
            phantom.exit();
        }, timeout);
    }, timeout);
});
