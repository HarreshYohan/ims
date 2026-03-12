const router = require('express').Router();
const subjectTutor = require('../controllers/subject_tutor.controller');

router.get('/all',    subjectTutor.findAll);
router.get('/:id',    subjectTutor.findOne);
router.post('/',      subjectTutor.create);
router.put('/:id',    subjectTutor.update);
router.delete('/:id', subjectTutor.delete);

module.exports = router;
