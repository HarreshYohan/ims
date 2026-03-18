const router = require('express').Router();
const grade = require('../controllers/grade.controller');
const authorize = require('../middleware/authorize');

router.get('/',     grade.findAll);
router.get('/:id',  grade.findOne);
router.post('/',    authorize('ADMIN', 'STAFF'), grade.validate('createGrade'), grade.create);
router.put('/:id',  authorize('ADMIN', 'STAFF'), grade.validate('updateGrade'), grade.update);
router.post('/bulk-create', authorize('ADMIN', 'STAFF'), grade.bulkCreate);
router.delete('/:id', authorize('ADMIN', 'STAFF'), grade.delete);

module.exports = router;
