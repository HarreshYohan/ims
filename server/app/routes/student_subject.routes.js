const router = require('express').Router();
const studentSubject = require('../controllers/student_subject.controller');

router.get('/all',                                    studentSubject.findAll);
router.get('/subjects/:studentid',                    studentSubject.getSubjectsForStudentGrade);
router.post('/add-subject',                           studentSubject.addSubjectToStudent);
router.delete('/remove-subject/:studentid/:subjectid', studentSubject.removeSubjectFromStudent);
router.get('/:id',                                    studentSubject.findOne);
router.post('/',                                      studentSubject.create);
router.delete('/:id',                                 studentSubject.delete);

module.exports = router;
