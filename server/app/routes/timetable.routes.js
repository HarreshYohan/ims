const router = require('express').Router();
const timetable = require('../controllers/timetable.controller');

router.get('/all',                    timetable.findAll);
router.get('/student-count/:studentid', timetable.getClassCount);
router.get('/tutor-count/:tutorid',   timetable.getTutorClassCount);
router.get('/student/:studentid',     timetable.findForStudent);
router.get('/tutor/:userid',          timetable.findForTutor);
router.get('/:id',                    timetable.findOne);
router.post('/',                      timetable.validate('create'), timetable.create);
router.delete('/:id',                 timetable.delete);

module.exports = router;