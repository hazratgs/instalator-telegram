const page = require('../../app/controllers/page');
const url = require('url');

module.exports = (app) => {

    app.get('/api/page/open', (req, res) => {
        res.send(page.open());
    });

    // Добавление новой страницы
    app.get('/api/page/create', (req, res) => {
        let param = url.parse(req.url, true).query;

        if (param.title){
            page.create(param, (err, data) => {
                if (err){
                    res.status(500).json({
                        "ok": false,
                        "error_code": 500,
                        "description": "Возникла ошибка при добавлении"
                    });
                } else {
                    res.json({
                        "ok": true,
                        "result": "Страница добавлена"
                    });
                }
            });
        } else {
            res.status(500).json({
                "ok": false,
                "error_code": 500,
                "description": "Нет необходимых данных"
            });
        }
    });

    // Поиск страницы
    app.get('/api/page/find', (req, res) => {
        let param = url.parse(req.url, true).query;

        if (param.q){
            page.find(param.q, (data) => {
                res.json({"ok": true, "result": data});
            });
        } else {
            res.status(500).json({
                "ok": false,
                "error_code": 500,
                "description": "Нет необходимых данных"
            });
        }
    });
};