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
            res.render('quiz', { questions: rows });
        }
    });
});
module.exports = router;
