import * as express from 'express'
let router = express.Router()

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
            res.render('quiz', { questions: rows })
        }
    })
})

export = router

