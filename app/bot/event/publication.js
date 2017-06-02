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
  event.on('publication:create:upload', (msg, action, next) => {
    console.log(msg.photo)
    if (!msg.hasOwnProperty('photo')){
      send.message(msg.from.id, 'Ошибка, я жду фотографию');
      return null
    }

    send.message(msg.from.id, 'Ok');
  });


  // Список публикаций, ожидающих публикацию (тавтология)
  event.on('publication:await', (msg, action, next) => {
    send.message(msg.from.id, 'Тут короче большой список постов, ожидающих публикацию');
    next ? next() : null
  });
};