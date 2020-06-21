import * as express from 'express'
import { isAuth } from '../tools/isAuth'
import * as sqlite3 from "sqlite3";
let router = express.Router()

import { promisify } from 'util'

const run = (db: sqlite3.Database) => promisify(db.run.bind(db))

router.use(isAuth)


router.get('/', (req, res) => {
    req.db.all(`
        SELECT quizzes.id, quizzes.name FROM
        quizzes LEFT JOIN 
            (
                SELECT quiz_id 
                FROM scores 
                WHERE user_id = ?
            ) AS solved
        ON quizzes.id = solved.quiz_id
        WHERE solved.quiz_id IS NULL    
    `, [req.session.user_id], (err, rows) => {
        if (err) {
            console.log(err)
            res.render('error', { message: "Could not get quizzes list", username: req.session.username })
        } else {
            if (rows.length == 0)
                res.render('quiz', { isEmpty: true, username: req.session.username })
            else
                res.render('quiz', { quizzes: rows, username: req.session.username })
        }
    })


})

router.get('/stats', (req, res) => {
    req.db.all(`
        SELECT scores.quiz_id AS id, quizzes.name AS name
        FROM scores INNER JOIN quizzes
        ON scores.quiz_id=quizzes.id
        WHERE scores.user_id = ?
    `, [req.session.user_id], (err, rows) => {
        if (err) {
            console.log(err)
            res.render('error', { message: `we could not get your scores`, username: req.session.username })
        } else {
            if (rows.length == 0)
                res.render('scoreSelection', { isEmpty: true, username: req.session.username })
            else
                res.render('scoreSelection', { quizzes: rows, username: req.session.username })
        }
    })
})


router.get('/:quizId', (req, res) => {
    const quizId = parseInt(req.params.quizId)
    userSolvedQuiz(req.session.user_id, quizId, req.db).then((did) => {
        if (did) {
            res.send({ error: 'thou shall not solve the same quiz twice' })
        } else {
            req.db.all(`
        SELECT content, penalty
        FROM questions
        WHERE quiz_id = ?
        ORDER BY id
    `, [quizId], (err, rows) => {
                if (err) {
                    console.log('ERROR at get quiz', quizId)
                    console.log(err)
                    res.render('error', { username: req.session.username })
                } else {
                    res.send(rows)
                }
            })
        }
    }).catch((reason) => {
        console.log(reason)
        res.send({ error: 'an error with database', username: req.session.username })
    })


})



function userSolvedQuiz(user_id: number, quiz_id: number, db: sqlite3.Database): Promise<boolean> {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM scores WHERE user_id=? AND quiz_id=?', [user_id, quiz_id], (err, row) => {
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

    console.log(req.body)
    console.log(JSON.stringify(req.body))

    userSolvedQuiz(req.session.user_id, quiz_id, req.db).then((did) => {
        if (did) {
            res.send({ error: 'thou shall not solve the same quiz more than once', username: req.session.username })
        } else {
            getCorrectAnswers(quiz_id, req.db)
                .then(async (corr) => {

                    const receivedAnswers = req.body as postedAnswer[]
                    if (receivedAnswers.length != corr.length) {
                        res.send({ error: 'how did this even happen' })
                    } else {
                        await run(req.db)('BEGIN TRANSACTION');
                        let score = 0
                        receivedAnswers.forEach(async (a, i) => {
                            let correct = 0
                            if (a.answer == corr[i].answer) {
                                correct = 1
                            }
                            else { score += corr[i].penalty }

                            score += a.time / 1000

                            await run(req.db)(`
                            INSERT INTO answers
                            (answer, time, time_percent, correct, user_id, question_id, quiz_id)
                            VALUES
                            (?, ?, ?, ?, ?, ?, ?)
                        `, [a.answer, a.time / 1000, a.timePercent, correct, req.session.user_id, corr[i].id, quiz_id]);
                        })
                        await run(req.db)(`INSERT INTO scores (score, user_id, quiz_id) VALUES (?, ?, ?)`, [
                            score, req.session.user_id, quiz_id
                        ]);
                        await run(req.db)('END TRANSACTION');
                        res.send({ ok: 'ok' })
                    }
                })
        }

    }).catch((reason) => {
        console.log(reason)
        res.send({ error: 'terrible error occured, please contact our support team', username: req.session.username })
    })

})

router.get('/:quizId/score', (req, res) => {
    const quiz_id = parseInt(req.params.quizId)
    userSolvedQuiz(req.session.user_id, quiz_id, req.db)
        .then((solved) => {
            if (!solved) {
                console.log('user didnt solve quiz')
                res.render('error', { message: 'you didnt solve that quiz', username: req.session.username })
            } else {
                Promise.all(
                    [
                        getUserScore(req.session.user_id, quiz_id, req.db),
                        getUserAnswers(req.session.user_id, quiz_id, req.db),
                        getCommunityScore(quiz_id, req.db),
                        getCorrectAnswers(quiz_id, req.db),
                        getQuestionContent(quiz_id, req.db)
                    ]).then(([userScore, userAnswers, communityScore, correctAnswers, questionsContent]) => {
                        res.render('score', {
                            userScore: userScore,
                            userAnswers: userAnswers,
                            communityScore: communityScore,
                            correctAnswers: correctAnswers,
                            questionsContent: questionsContent,
                            username: req.session.username
                        })
                    }).catch((reason) => {
                        console.log('error in promise.all')
                        console.log(reason)
                        res.render('error', { message: reason, username: req.session.username })
                    })
            }
        })
        .catch((reason) => {
            console.log('error in userSolvedQuiz')
            console.log(reason)
            res.render('error', { message: 'something went wrong', username: req.session.username })
        })

})

// [{answer, }

function getUserScore(user_id: number, quiz_id: number, db: sqlite3.Database): Promise<number> {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT score
            FROM scores
            WHERE user_id=? AND quiz_id=?
        `, [user_id, quiz_id], (err, row) => {
            if (err) {
                console.log(err)
                reject(`couldn't get user score`)
            }
            resolve(row.score)
        })
    })
}

function getQuestionContent(quiz_id: number, db: sqlite3.Database): Promise<JSON[]> {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT content
            FROM questions
            WHERE quiz_id = ?
            ORDER BY id
        `, [quiz_id], (err, rows) => {
            if (err)
                reject(err)
            resolve(rows)
        })
    })
}

function getUserAnswers(user_id: number, quiz_id: number, db: sqlite3.Database): Promise<JSON[]> {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT answer, time, correct
            FROM answers
            WHERE user_id = ? AND quiz_id = ?
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

type communityScore = {
    avgTime: number
    fracCorrect: number
}

function getCommunityScore(quiz_id: number, db: sqlite3.Database): Promise<communityScore[]> {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT AVG(time) AS avgTime, AVG(correct) AS fracCorrect
            FROM answers
            WHERE quiz_id = ?
            GROUP BY question_id
        `, [quiz_id], (err, rows) => {
            if (err)
                reject(err)
            resolve(rows as communityScore[])
        })
    })
}

type CorrectAnswer = {
    answer: number,
    penalty: number,
    id: number
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


router.get('*', (req, res, next) => {
    next()
})

export = router

