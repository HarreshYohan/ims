const router = require('express').Router();
const quiz = require('../controllers/quiz.controller');

router.get('/generate/:userid', quiz.generate);
router.post('/submit', quiz.submit);
router.get('/history/:userid', quiz.getHistory);

module.exports = router;
