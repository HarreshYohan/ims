const router = require('express').Router();
const tutor = require('../controllers/tutor.controller');

router.get('/all',                              tutor.findAll);
router.get('/grades/all',                       tutor.getAllGrades);
router.get('/subject-mapping/:id',              tutor.getSubjectMapping);
router.get('/subjects/:gradeid',                tutor.getSubjectsByGrade);
router.get('/:id',                              tutor.findOne);
router.post('/',                                tutor.create);
router.put('/:id',                              tutor.update);
router.delete('/:id',                           tutor.delete);
router.post('/add-subject',                     tutor.addSubjectToTutor);
router.delete('/remove-subject/:tutorid/:mappingid', tutor.removeSubject);

module.exports = router;