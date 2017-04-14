const source = require(process.cwd() + '/app/controllers/source');
const url = require('url');

module.exports = (app) => {

    app.get('/source', (req, res) => {
        res.send(source.list());
    });
};