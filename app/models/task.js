let db = require('../../libs/db');

// Модель задания
let TaskSchema = new db.mongoose.Schema({
    user: {type: Number, required: [true, 'userRequired']},
    login: {type: String, required: [true, 'loginRequired']},
    type: {type: String, required: [true, 'typeRequired']},
    source: {type: String, required: [true, 'sourceRequired']},
    action: {type: Number, required: [true, 'actionRequired']}, // кол. действий
    actionPerDay: {type: Number, required: [true, 'actionPerDayRequired']}, // кол. действий
    current: {type: Number, default: 0}, // текущее кол. действий
    like: {type: Number, default: 2}, // кол. лайков профилю
    status: {type: String, default: 'active'}, // Статус задания (active, cancel, success)
    date: {type: Date, default: Date.now}
});

exports.Task = db.connect.model('Task', TaskSchema);