const router = require('express').Router();
const classroom = require('../controllers/classroom.controller');

router.get('/all',  classroom.findAll);
router.get('/:id',  classroom.findOne);
router.post('/',    classroom.create);
router.put('/:id',  classroom.update);
router.delete('/:id', classroom.delete);

module.exports = router;
