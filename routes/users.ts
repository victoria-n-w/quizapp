import * as express from 'express'
import * as sqlite3 from 'sqlite3'

import csrf from 'csurf'
const csrfProtection = csrf({ cookie: true })

const sqlite = sqlite3.verbose()

let router = express.Router()


const sqlGetUser = `
        SELECT id, session_control FROM users  
        WHERE username = ? AND password = ?
    `

type userLog = {
    id: number
    session_control: number
}

function prGetUser(username: string, password: string): Promise<userLog> {
    return new Promise((resolve, rejects) => {
        const db = new sqlite.Database('base.db')
        db.get(sqlGetUser, [username, password], (err, row) => {
            if (err)
                rejects(err)
            if (row)
                resolve(row)
            else
                resolve(undefined)
        })
        db.close()

    })
}

router.post('/auth', csrfProtection, (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        prGetUser(username, password).then((row) => {
            if (row == undefined) {
                res.render('login', { invalid: true })
            } else {
                req.session.loggedin = true;
                req.session.username = username;
                req.session.user_id = row.id
                req.session.session_control = row.session_control
                res.redirect('/');
            }
        }).catch((reason) => {
            console.log('error at login')
            console.log(reason)
            res.render('error', { message: 'Something went wrong' })
        })
    } else {
        res.render('login', { missing: true });
    }
});


router.get('/login', csrfProtection, (req, res) => {
    if (req.session.loggedin) {
        res.redirect('/')
    } else {
        res.render('login', { title: 'login', csrfToken: req.csrfToken() })
    }
})

router.get('/changepass', csrfProtection, (req, res) => {
    res.render('changepass', { username: req.session.username, csrfToken: req.csrfToken() })
})


router.post('/changepass', csrfProtection, (req, res) => {
    if (req.body.newPassword && req.body.confirmPassword && req.body.password) {
        req.db.get(`
            SELECT * FROM users WHERE id=? AND password = ?
        `, [req.session.user_id, req.body.password], (err, row) => {
            if (err) {
                console.log(err)
                res.render('error', { message: 'thou cannot do that right now', username: req.session.username })
            } else if (row == undefined || req.body.newPassword !== req.body.confirmPassword) {
                res.render('changepass', { invalid: true, csrfToken: req.csrfToken(), username: req.session.username })
            } else {
                req.db.run(`
                    UPDATE users
                    SET password=?, session_control=session_control+1
                    WHERE id = ?
                `, [req.body.newPassword, req.session.user_id], (err) => {
                    if (err) {
                        console.log(err)
                    }
                })
                delete (req.session.user_id)
                delete (req.session.loggedin)
                delete (req.session.username)

                res.redirect('/users/login')
            }
        })

    } else {
        res.render('changepass', { invalid: true, csrfToken: req.csrfToken() })
    }
})

router.post('/logout', (req, res) => {
    delete (req.session.loggedin)
    delete (req.session.user_id)
    delete (req.session.username)
    res.redirect('/users/login')
})

export = router