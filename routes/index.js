var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Quizapp', loggedin: req.session.loggedin })
});

module.exports = router;

