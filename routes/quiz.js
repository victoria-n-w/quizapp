"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
const express = __importStar(require("express"));
let router = express.Router();
router.get('/:quizId', (req, res) => {
    const quizId = parseInt(req.params.quizId);
    req.db.all(`
        SELECT content, answer, penalty
        FROM questions
        WHERE quiz_id = ?
        ORDER BY id
    `, [quizId], (err, rows) => {
        if (err) {
            console.log('ERROR at get quiz', quizId);
            console.log(err);
            res.render('error');
        }
        else {
            res.send(rows);
        }
    });
});
router.get('/', (req, res) => {
    req.db.all('SELECT * FROM quizzes ORDER BY id', [], (err, rows) => {
        if (err) {
            console.log(err);
            res.render('error', { message: "Could not get quizzes list" });
        }
        else {
            res.render('quiz', { quizzes: rows });
        }
    });
});
function userSolvedQuiz(user_id, quiz_id, db) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM scores WHERE user_id=?, quiz_id=?', [user_id, quiz_id], (err, row) => {
            if (err)
                reject(err);
            if (row == undefined) {
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
}
router.post('/:quizId/solve', (req, res) => {
    if (!req.session.loggedin)
        res.send({ error: 'you have to log in to solve the quiz' });
    else {
    }
});
router.get('/api/:quizId/scores', (req, res) => {
    if (!req.session.loggedin)
        res.send({ error: 'you have to log in to solve the quiz' });
    else {
        const quiz_id = parseInt(req.params.quizId);
        userSolvedQuiz(req.session.user_id, quiz_id, req.db)
            .then((solved) => {
            if (!solved) {
                res.send({ error: 'you didnt solve that quiz' });
            }
            else {
                Promise.all([
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
                    });
                }).catch((reason) => {
                    res.send({
                        error: reason
                    });
                });
            }
        });
    }
});
function getUserScore(user_id, quiz_id, db) {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT score
            FROM scores
            WHERE user_id=?, quiz_id=?
        `, [user_id, quiz_id], (err, row) => {
            if (err) {
                console.log(err);
                reject(`couldn't get user score`);
            }
            resolve(row.score);
        });
    });
}
function getUserAnswers(user_id, quiz_id, db) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT answer, time, correct
            FROM answers
            WHERE user_id = ?, quiz_id = ?
            ORDER BY question_id
        `, [user_id, quiz_id], (err, rows) => {
            if (err) {
                console.log(err);
                reject(`couldn't get user answers`);
            }
            resolve(rows);
        });
    });
}
function getCommunityScore(quiz_id, db) {
    let a;
    return a;
}
function getCorrectAnswers(quiz_id, db) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT answer
            FROM questions
            WHERE quiz_id = ?
            ORDER BY id;
        `, [quiz_id], (err, rows) => {
            if (err) {
                console.log(err);
                reject(`couldn't get correct answers`);
            }
            resolve(rows);
        });
    });
}
module.exports = router;
