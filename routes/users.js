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
        SELECT id, session_control FROM users  
        WHERE username = ? AND password = ?
    `;
function prGetUser(username, password) {
    return new Promise((resolve, rejects) => {
        const db = new sqlite.Database('base.db');
        db.get(sqlGetUser, [username, password], (err, row) => {
            if (err)
                rejects(err);
            if (row)
                resolve(row);
            else
                resolve(undefined);
        });
        db.close();
    });
}
router.post('/auth', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        prGetUser(username, password).then((row) => {
            if (row == undefined) {
                res.render('login', { invalid: true });
            }
            else {
                req.session.loggedin = true;
                req.session.username = username;
                req.session.user_id = row.id;
                req.session.session_control = row.session_control;
                res.redirect('/');
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
    console.log('xddd');
    if (req.session.loggedin) {
        res.redirect('/');
    }
    else {
        res.render('login', { title: 'login' });
    }
});
router.get('/changepass', (req, res) => {
    res.render('changepass');
});
router.post('/changepass', (req, res) => {
    if (req.body.newPassword && req.body.confirmPassword) {
    }
    else {
        res.render('changepass', { invalid: true });
    }
});
router.get('/logout', (req, res) => {
    delete (req.session.loggedin);
    delete (req.session.user_id);
    res.redirect('/users/login');
});
module.exports = router;
