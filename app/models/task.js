let db = require('../../libs/db');

// Модель задания
let TaskSchema = new db.mongoose.Schema({
    user: {type: Number, required: [true, 'userRequired']},
    login: {type: String, required: [true, 'loginRequired']},
    type: {type: String, required: [true, 'typeRequired']},
    params: {type: Array, required: [true, 'paramsRequired']}, // Массив для хранения специфичные для типа данных
    state: {type: Number, default: 0}, // состояние
    status: {type: String, default: 'active'}, // Статус задания (active, cancel, success)
    date: {type: Date, default: Date.now}
});

exports.Task = db.connect.model('Task', TaskSchema);