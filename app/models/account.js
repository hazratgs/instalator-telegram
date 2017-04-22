const db = require('../../libs/db');

// Модель аккаунта
const AccountSchema = new db.mongoose.Schema({
    user: {type: Number, required: [true, "userRequired"]},
    login: {type: String, required: [true, "loginRequired"]},
    password: {type: String, required: [true, "passwordRequired"]},
    verified: {type: Boolean, default: false},
    date: {type: Date, default: Date.now}
});

// Модель подписок
const AccountFollowSchema = new db.mongoose.Schema({
    user: {type: Number, required: [true, "userRequired"]},
    login: {type: String, required: [true, "loginRequired"]},
    data: {type: Array, default: []}
});

// Модель лайков
const AccountLikeSchema = new db.mongoose.Schema({
    user: {type: Number, required: [true, "userRequired"]},
    login: {type: String, required: [true, "loginRequired"]},
    data: {type: Array, default: []}
});

exports.Account = db.connect.model("Account", AccountSchema);
exports.AccountFollow = db.connect.model("AccountFollow", AccountFollowSchema);
exports.AccountLike = db.connect.model("AccountLike", AccountLikeSchema);