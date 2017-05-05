const emoji = {
    'Назад': '⬅',
    'Удалить': '❌',
    'Отменить': '❌',
    'Создать задание': '🖋️',
    'Активность': '📈',
    'Аккаунты': '📑',
};

// Добавляем эмодзи
exports.encode = (text) => {
    return emoji.hasOwnProperty(text)
        ? emoji[text] + ' ' + text
        : text
};

// Декодируем эмодзи
exports.decode = (text) => {
    let val = text.split(' ');

    // Пропускаем если не содержит эмодзи
    if (val.length < 2) return text;

    val.splice(0, 1);
    val = val.join(' ');

    // Обходим эмодзи в поисках контекста
    for (let key in emoji){
        if (key === val) return key
    }

    return text
};