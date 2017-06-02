const Telegram = require('../../../libs/telegramBot');
const conf = require('../../../conf')
const https = require('https');
const fs = require('fs');

module.exports = (event, state, log, map, send) => {

  // Главное меню
  event.on('publication', (msg, action, next) => {
    send.keyboard(msg.from.id, 'Выберите действие', action);
    next ? next() : null
  });

  // Добавить отложенную публикацию
  event.on('publication:create', (msg, action, next) => {
    send.keyboard(msg.from.id, 'Загрузите фотографию', ['Назад']);
    next ? next() : null
  });

  // Добавить отложенную публикацию
  event.on('publication:create:upload', async (msg, action, next) => {
    if (!msg.hasOwnProperty('photo')){
      send.message(msg.from.id, 'Ошибка, я жду фотографию');
      return null
    }

    // ID файла
    let id = msg.photo[msg.photo.length - 1].file_id;

    // Получаем путь к файлу
    let file = await Telegram.getFile(id)
    let url = `https://api.telegram.org/file/bot${conf.get('telegram:token')}/${file.file_path}`;

    // Формирование нового имени для файла
    let name = '';

    let fileStream = fs.createWriteStream(`/public/img/publication/`);
    https.get(url, response => {
        response.pipe(fileStream);
        send.message(msg.from.id, 'Успешно загружено');
    })
  });


  // Список публикаций, ожидающих публикацию (тавтология)
  event.on('publication:await', (msg, action, next) => {
    send.message(msg.from.id, 'Тут короче большой список постов, ожидающих публикацию');
    next ? next() : null
  });
};