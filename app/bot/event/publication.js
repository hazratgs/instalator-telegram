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
      next(name);

    } catch (e){
      send.message(msg.from.id, 'Возникла ошибка, повторите еще раз');
    }
  });

  // Подпись для новой отложенной публикации
  event.on('publication:create:title', async (msg, action, next) => {
    send.message(msg.from.id, 'Укажите время публикации (мин час день месяц год), пример: 30 19 04 08 2017');
    next();
  });

  // Обработка даты публикации
  event.on('publication:create:date', (msg, action, next) => {
    let date = new Date();

    // Здесь храним актуальную дату, чтобы пользователь мог вводить, например только минуты
    // или минтуы и часы, в этом случаи день, месяц и год будут автоматически
    // использоваться текущие
    let startDate = [
        date.getMinutes(),
        date.getHours(),
        date.getDay(),
        date.getMonth(),
        date.getFullYear()
    ];

    // Мутабельное решение, изменяем первоначальное состояние,
    // дабы клиенты наши кайфанули от того, что не надо писать
    // полностью дату публикации поста (30 19 10 06 2017),
    // а очень коротко (30 19) и он опубликуется сегодня в 19:30
    msg.text.split(' ').map((item, index) => startDate[index] = item)

    // Cохранение отложенной публикации
    // Publication.save(msg.from)
  });

  // Список публикаций, ожидающих публикацию (тавтология)
  event.on('publication:await', (msg, action, next) => {
    send.message(msg.from.id, 'Тут короче большой список постов, ожидающих публикацию');
    next ? next() : null
  });
};