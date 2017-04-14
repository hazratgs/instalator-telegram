const path = require('path');
const fs = require('fs');
const exec = require("child_process").exec;
const dir = process.cwd();

// Авторизация
exports.auth = (login, password, callback) => {
    return exec(`phantomjs --cookies-file=${dir}/bin/instanode/cookies/${login}.txt ${dir}/bin/instanode/auth.js ${login} ${password}`, (error, stdout, stderr) => {
        callback(error, stdout, stderr)
    });
};
