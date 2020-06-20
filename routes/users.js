"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
const express = __importStar(require("express"));
const sqlite3 = __importStar(require("sqlite3"));
const sqlite = sqlite3.verbose();
let router = express.Router();
const sqlGetUser = `
        SELECT id FROM users  
        WHERE username = ? AND password = ?
    `;
function prGetUser(username, password) {
    return new Promise((resolve, rejects) => {
        const db = new sqlite.Database('base.db');
        db.get(sqlGetUser, [username, password], (err, row) => {
            if (err)
                rejects(err);
            if (row)
                resolve(row.id);
            resolve(-1);
        });
        db.close();
    });
}
router.post('/auth', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        prGetUser(username, password).then((id) => {
            if (id >= 0) {
                req.session.loggedin = true;
                req.session.username = username;
                req.session.user_id = id;
                res.redirect('/');
            }
            else {
                res.render('login', { invalid: true });
            }
        }).catch((reason) => {
            console.log('error at login');
            console.log(reason);
            res.render('error', { message: 'Something went wrong' });
        });
    }
    else {
        res.render('login', { missing: true });
    }
});
router.get('/login', (req, res) => {
    if (req.session.loggedin) {
        res.redirect('/profile');
    }
    else {
        res.render('login', { title: 'login' });
    }
});
module.exports = router;
