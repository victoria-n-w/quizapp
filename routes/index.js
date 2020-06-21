"use strict";
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
router.get('/', isAuth_1.isAuth, (req, res) => {
    res.render('index', { title: 'Quizapp', loggedin: true });
});
module.exports = router;
