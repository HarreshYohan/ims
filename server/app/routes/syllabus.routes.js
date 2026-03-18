const router = require('express').Router();
const syllabus = require('../controllers/syllabus.controller');

router.get('/', syllabus.findAll);
router.get('/:id', syllabus.findOne);
router.post('/', syllabus.create);
router.put('/:id', syllabus.update);
router.delete('/:id', syllabus.delete);

module.exports = router;
