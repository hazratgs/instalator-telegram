const Telegram = require('../../libs/telegramBot');
const conf = require('../../conf');
const downloader = require('download-file-random');
const Model = require('../models/publication');

exports.upload = async (msg) => {
    let id = msg.photo[msg.photo.length - 1].file_id;

    // Получаем путь к файлу
    let file = await Telegram.getFile(id);
    let url = `https://api.telegram.org/file/bot${conf.get('telegram:token')}/${file.file_path}`;

    // Загрузка файла
    return downloader(url, { path: '/public/img/publication/' });
};