const source = require('../../app/controllers/source');

module.exports = (app) => {

    // Добавление новой базы данных
    app.post('/source/create', (req, res) => {
        if (!req.body.name || !req.body.source){
            res.status(500).json({
                'ok': false,
                'error_code': 500,
                'description': `Возникла ошибка при добавлении`
            });
            return null;
        }

        // Сортировка источника
        let data = [];
        for (let item of req.body.source.split(' ')){
            if (item.trim() == '') continue;
            data.push(item.trim());
        }

        // Проверяем существование источника
        source.contains(req.body.name, (result) => {
            if (result.length){
                res.status(500).json({
                    'ok': false,
                    'error_code': 500,
                    'description': `База ${req.body.name} уже существует`
                });
                return null;
            }

            // Сохраняем данные
            source.create({
                name: req.body.name,
                source: data
            }, (err) => {
                if (!err){
                    res.json({
                        'ok': true,
                        'result': `Источник добавлен`
                    });
                } else {
                    res.status(500).json({
                        'ok': false,
                        'error_code': 500,
                        'description': `Не удалось сохранить базу ${req.body.name}`
                    });
                }
            })
        });
    });

    // Удаление источника
    app.delete('/source/remove', (req, res) => {
        source.contains(req.body.name, (result) => {
            if (result.length){
                source.remove(req.body.name, () => {
                    res.json({
                        'ok': true,
                        'result': `Источник удален`
                    });
                });
            } else {
                res.status(500).json({
                    'ok': false,
                    'error_code': 500,
                    'description': `Источник ${req.body.name} не существует`
                });
            }
        })
    });
};