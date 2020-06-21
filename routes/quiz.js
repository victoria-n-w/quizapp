"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
const express = __importStar(require("express"));
const isAuth_1 = require("../tools/isAuth");
let router = express.Router();
const util_1 = require("util");
const run = (db) => util_1.promisify(db.run.bind(db));
router.use(isAuth_1.isAuth);
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
            console.log(err);
            res.render('error', { message: "Could not get quizzes list" });
        }
        else {
            if (rows.length == 0)
                res.render('quiz', { isEmpty: true });
            else
                res.render('quiz', { quizzes: rows });
        }
    });
});
router.get('/stats', (req, res) => {
    req.db.all(`
        SELECT scores.quiz_id AS id, quizzes.name AS name
        FROM scores INNER JOIN quizzes
        ON scores.quiz_id=quizzes.id
        WHERE scores.user_id = ?
    `, [req.session.user_id], (err, rows) => {
        if (err) {
            console.log(err);
            res.render('error', { message: `we could not get your scores` });
        }
        else {
            if (rows.length == 0)
                res.render('scoreSelection', { isEmpty: true });
            else
                res.render('scoreSelection', { quizzes: rows });
        }
    });
});
router.get('/:quizId', (req, res) => {
    const quizId = parseInt(req.params.quizId);
    userSolvedQuiz(req.session.user_id, quizId, req.db).then((did) => {
        if (did) {
            res.send({ error: 'thou shall not solve the same quiz twice' });
        }
        else {
            req.db.all(`
        SELECT content, penalty
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
        }
    }).catch((reason) => {
        console.log(reason);
        res.send({ error: 'an error with database' });
    });
});
function userSolvedQuiz(user_id, quiz_id, db) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM scores WHERE user_id=? AND quiz_id=?', [user_id, quiz_id], (err, row) => {
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
    const quiz_id = parseInt(req.params.quizId);
    console.log(req.body);
    console.log(JSON.stringify(req.body));
    userSolvedQuiz(req.session.user_id, quiz_id, req.db).then((did) => {
        if (did) {
            res.send({ error: 'thou shall not solve the same quiz more than once' });
        }
        else {
            getCorrectAnswers(quiz_id, req.db)
                .then((corr) => __awaiter(void 0, void 0, void 0, function* () {
                const receivedAnswers = req.body;
                if (receivedAnswers.length != corr.length) {
                    res.send({ error: 'how did this even happen' });
                }
                else {
                    yield run(req.db)('BEGIN TRANSACTION');
                    let score = 0;
                    receivedAnswers.forEach((a, i) => __awaiter(void 0, void 0, void 0, function* () {
                        let correct = 0;
                        if (a.answer == corr[i].answer) {
                            correct = 1;
                        }
                        else {
                            score += corr[i].penalty;
                        }
                        score += a.time / 1000;
                        yield run(req.db)(`
                            INSERT INTO answers
                            (answer, time, time_percent, correct, user_id, question_id, quiz_id)
                            VALUES
                            (?, ?, ?, ?, ?, ?, ?)
                        `, [a.answer, a.time / 1000, a.timePercent, correct, req.session.user_id, corr[i].id, quiz_id]);
                    }));
                    yield run(req.db)(`INSERT INTO scores (score, user_id, quiz_id) VALUES (?, ?, ?)`, [
                        score, req.session.user_id, quiz_id
                    ]);
                    yield run(req.db)('END TRANSACTION');
                    res.send({ ok: 'ok' });
                }
            }));
        }
    }).catch((reason) => {
        console.log(reason);
        res.send({ error: 'terrible error occured, please contact our support team' });
    });
});
router.get('/:quizId/score', (req, res) => {
    const quiz_id = parseInt(req.params.quizId);
    userSolvedQuiz(req.session.user_id, quiz_id, req.db)
        .then((solved) => {
        if (!solved) {
            console.log('user didnt solve quiz');
            res.render('error', { message: 'you didnt solve that quiz' });
        }
        else {
            Promise.all([
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
                    questionsContent: questionsContent
                });
            }).catch((reason) => {
                console.log('error in promise.all');
                console.log(reason);
                res.render('error', { message: reason });
            });
        }
    })
        .catch((reason) => {
        console.log('error in userSolvedQuiz');
        console.log(reason);
        res.render('error', { message: 'something went wrong' });
    });
});
function getUserScore(user_id, quiz_id, db) {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT score
            FROM scores
            WHERE user_id=? AND quiz_id=?
        `, [user_id, quiz_id], (err, row) => {
            if (err) {
                console.log(err);
                reject(`couldn't get user score`);
            }
            resolve(row.score);
        });
    });
}
function getQuestionContent(quiz_id, db) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT content
            FROM questions
            WHERE quiz_id = ?
            ORDER BY id
        `, [quiz_id], (err, rows) => {
            if (err)
                reject(err);
            resolve(rows);
        });
    });
}
function getUserAnswers(user_id, quiz_id, db) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT answer, time, correct
            FROM answers
            WHERE user_id = ? AND quiz_id = ?
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
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT AVG(time) AS avgTime, AVG(correct) AS fracCorrect
            FROM answers
            WHERE quiz_id = ?
            GROUP BY question_id
        `, [quiz_id], (err, rows) => {
            if (err)
                reject(err);
            resolve(rows);
        });
    });
}
function getCorrectAnswers(quiz_id, db) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT answer, penalty, id
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
router.get('*', (req, res, next) => {
    next();
});
module.exports = router;
