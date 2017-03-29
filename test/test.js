const assert = require('assert');

const page = require(process.cwd() + '/app/controllers/page');

it ("Тестовый запуск", () => {
    page.test();
});