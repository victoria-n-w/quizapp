import * as express from 'express'
import * as sqlite3 from "sqlite3";
let router = express.Router()

import { promisify } from 'util'

const run = (db: sqlite3.Database) => promisify(db.run.bind(db))

router.use('*', (req, res, next) => {
    if (!req.session.loggedin) {
        res.render('error', { message: 'You have to be logged in, in order to solve quizzes' })
    } else {
        next()
    }
})

router.get('/:quizId', (req, res) => {
    const quizId = parseInt(req.params.quizId)
    req.db.all(`
        SELECT content, answer, penalty
        FROM questions
        WHERE quiz_id = ?
        ORDER BY id
    `, [quizId], (err, rows) => {
        if (err) {
            console.log('ERROR at get quiz', quizId)
            console.log(err)
            res.render('error')
        } else {
            res.send(rows)
        }
    })
})


router.get('/', (req, res) => {
    req.db.all(`
        SELECT quizzes.id, quizzes.name FROM
        quizzes 
        LEFT JOIN scores
        ON quizzes.id = scores.quiz_id
        WHERE scores.quiz_id IS NULL
        ORDER BY quiz_id
    `, [], (err, rows) => {
        if (err) {
            console.log(err)
            res.render('error', { message: "Could not get quizzes list" })
        } else {
            res.render('quiz', { quizzes: rows })
        }
    })


})

function userSolvedQuiz(user_id: number, quiz_id: number, db: sqlite3.Database): Promise<boolean> {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM scores WHERE user_id=?, quiz_id=?', [user_id, quiz_id], (err, row) => {
            if (err)
                reject(err)
            if (row == undefined) {
                resolve(false)
            } else {
                resolve(true)
            }
        })
    })
}

type postedAnswer = {
    answer: number,
    time: number,
    timePercent: number
}

router.post('/:quizId/solve', (req, res) => {
    const quiz_id = parseInt(req.params.quizId)

    if (userSolvedQuiz(req.session.user_id, quiz_id, req.db)) {
        res.send({ error: 'thou cannot solve the same quiz twice' })
    } else {
        getCorrectAnswers(quiz_id, req.db)
            .then(async (corr) => {
                if (req.body.answers.length != corr.length) {
                    res.send({ error: 'how did this even happen' })
                } else {
                    await run(req.db)('BEGIN TRANSACTION')
                    const answers = req.body.answers as postedAnswer[]
                    let score = 0
                    answers.forEach(async (a, i) => {
                        let correct = 0
                        if (a.answer == corr[i].answer)
                            correct = 1
                        else
                            score += corr[i].penalty

                        score += a.time

                        await run(req.db)(`
                            INSERT INTO answers
                            (answer, time, time_percent, correct, user_id, question_id, quiz_id)
                            VALUES
                            (?, ?, ?, ?, ?, ?, ?)
                        `, [a.answer, a.time, a.timePercent, correct, req.session.user_id, corr[i].question_id, quiz_id])
                    })
                    await run(req.db)(`INSERT INTO scores (score, user_id, quiz_id) VALUES (?, ?, ?)`, [
                        score, req.session.user_id, quiz_id
                    ])
                    await run(req.db)('END TRANSACTION')
                    res.send({ ok: 'ok' })
                }
            })
    }

})

router.get('/api/:quizId/scores', (req, res) => {
    const quiz_id = parseInt(req.params.quizId)
    userSolvedQuiz(req.session.user_id, quiz_id, req.db)
        .then((solved) => {
            if (!solved) {
                res.send({ error: 'you didnt solve that quiz' })
            } else {
                Promise.all(
                    [
                        getUserScore(req.session.user_id, quiz_id, req.db),
                        getUserAnswers(req.session.user_id, quiz_id, req.db),
                        getCommunityScore(quiz_id, req.db),
                        getCorrectAnswers(quiz_id, req.db)
                    ]).then(([userScore, userAnswers, communityScore, correctAnswers]) => {
                        res.send({
                            userScore: userScore,
                            userAnswers: userAnswers,
                            communityScore: communityScore,
                            correctAnswers: correctAnswers
                        })
                    }).catch((reason) => {
                        res.send({
                            error: reason
                        })
                    })
            }
        })

})

// [{answer, }

function getUserScore(user_id: number, quiz_id: number, db: sqlite3.Database): Promise<number> {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT score
            FROM scores
            WHERE user_id=?, quiz_id=?
        `, [user_id, quiz_id], (err, row) => {
            if (err) {
                console.log(err)
                reject(`couldn't get user score`)
            }
            resolve(row.score)
        })
    })
}


function getUserAnswers(user_id: number, quiz_id: number, db: sqlite3.Database): Promise<JSON[]> {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT answer, time, correct
            FROM answers
            WHERE user_id = ?, quiz_id = ?
            ORDER BY question_id
        `, [user_id, quiz_id], (err, rows) => {
            if (err) {
                console.log(err)
                reject(`couldn't get user answers`)
            }
            resolve(rows)
        })
    })
}


function getCommunityScore(quiz_id: number, db: sqlite3.Database): Promise<JSON[]> {
    // TODO : wszystko
    let a: Promise<JSON[]>
    return a
}

type CorrectAnswer = {
    answer: number,
    penalty: number,
    question_id: number
}

function getCorrectAnswers(quiz_id: number, db: sqlite3.Database): Promise<CorrectAnswer[]> {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT answer, penalty, id
            FROM questions
            WHERE quiz_id = ?
            ORDER BY id;
        `, [quiz_id], (err, rows) => {
            if (err) {
                console.log(err)
                reject(`couldn't get correct answers`)
            }
            resolve(rows)
        })
    })
}

export = router

