let db = require('../../libs/db');

// Модель аккаунта
let AccountSchema = new db.mongoose.Schema({
    user: {type: Number, required: [true, "userRequired"]},
    login: {type: String, required: [true, "loginRequired"]},
    password: {type: String, required: [true, "passwordRequired"]},
    verified: {type: Boolean, default: false},
    date: {type: Date, default: Date.now}
});

exports.Account = db.connect.model("Account", AccountSchema);