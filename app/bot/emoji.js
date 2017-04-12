const emoji = {
    'Назад': '👈'
};

// Добавляем эмодзи
exports.encode = (text) => {
    return emoji.hasOwnProperty(text)
        ? emoji[text] + ' ' + text
        : text
};

// Декодируем эмодзи
exports.decode = (text) => {
    let val = text.slice(3);

    // Обходим эмодзи в поисках контекста
    for (let key in emoji){
        if (key == val) return key
    }

    return text
};