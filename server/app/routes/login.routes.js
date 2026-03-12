const router = require('express').Router();
const login = require('../controllers/login.controller');

router.post('/login', login.login);
router.post('/signup', login.signup);

module.exports = router;