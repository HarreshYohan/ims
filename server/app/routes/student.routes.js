const router = require('express').Router();
const student = require('../controllers/student.controller');

router.get('/all',                    student.findAll);
router.get('/download/all',           student.downloadAll);
router.get('/student-subject/:id',    student.student_subject);
router.get('/:id',                    student.findOne);
router.post('/',                      student.validate('createUser'), student.create);
router.put('/:id',                    student.update);
router.delete('/:id',                 student.delete);

module.exports = router;