const db = require('../../libs/db');

// Модель аккаунта
const AccountSchema = new db.mongoose.Schema({
    user: {type: Number, required: [true, "userRequired"]},
    account: {type: String, required: [true, "accountRequired"]},
    password: {type: String, required: [true, "passwordRequired"]},
    verified: {type: Boolean, default: false},
    date: {type: Date, default: Date.now}
});

// Модель выполненых задач
const AccountFollowSchema = new db.mongoose.Schema({
    user: {type: Number, required: [true, "userRequired"]},
    account: {type: String, required: [true, "accountRequired"]},
    data: {type: Array, default: []}
});

exports.Account = db.connect.model("Account", AccountSchema);
exports.AccountFollow = db.connect.model("AccountFollow", AccountFollowSchema);