const emoji = {
    'Назад': '⬅',
    'Удалить': '❌'
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

    // Обходим эмодзи в поисках контекста
    for (let key in emoji){
        if (key == val[1]) return key
    }

    return text
};