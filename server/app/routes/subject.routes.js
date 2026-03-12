const router = require('express').Router();
const subject = require('../controllers/subject.controller');

router.get('/all',    subject.findAll);
router.get('/:id',    subject.findOne);
router.post('/',      subject.create);
router.delete('/:id', subject.delete);

module.exports = router;