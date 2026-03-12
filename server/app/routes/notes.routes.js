const router = require('express').Router();
const notes = require('../controllers/notes.controller');

router.get('/all',                        notes.findAll);
router.get('/count/:userid',              notes.getNotesCountForStudent);
router.get('/count-tutor/:id',            notes.getNotesCountForTutor);
router.get('/subjects-grades/:userid',    notes.getTutorSubjectsAndGrades);
router.get('/tutor/notes-for-approval',   notes.getNotesForApproval);
router.get('/tutor/approved-notes',       notes.getApprovedNotes);
router.get('/student/:userid/:subject',   notes.findByStudentAndSubject);
router.put('/tutor/review-note/:id',      notes.reviewNote);
router.get('/:id',                        notes.findOne);
router.post('/',                          notes.create);
router.put('/:id',                        notes.update);
router.delete('/:id',                     notes.delete);

module.exports = router;
