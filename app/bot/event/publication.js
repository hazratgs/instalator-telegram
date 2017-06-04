const Publication = require('../../controllers/publication');

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
      return null;
    }

    try {

      // Загружаем фото
      let name = await Publication.upload(msg);

      // Переходим к следующему шагу
      send.message(msg.from.id, 'Фотография успешно загружена');
      send.message(msg.from.id, 'Введите подпись');
      next();

    } catch (e){
      send.message(msg.from.id, 'Возникла ошибка, повторите еще раз');
    }
  });

  // Список публикаций, ожидающих публикацию (тавтология)
  event.on('publication:await', (msg, action, next) => {
    send.message(msg.from.id, 'Тут короче большой список постов, ожидающих публикацию');
    next ? next() : null
  });
};