const router = require('express').Router();
const user = require('../controllers/user.controller');

router.get('/all',  user.findAll);
router.get('/:id',  user.findOne);

module.exports = router;