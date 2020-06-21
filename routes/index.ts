import * as express from 'express'
import { route } from './quiz'
import { isAuth } from '../tools/isAuth'

let router = express.Router()


router.get('/', isAuth, (req, res) => {
    res.render('index', { title: 'Quizapp', loggedin: true, username: req.session.username })
})

export = router