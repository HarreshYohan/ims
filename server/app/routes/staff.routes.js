const router = require('express').Router();
const staff = require('../controllers/staff.controller');

router.get('/all',  staff.findAll);
router.get('/:id',  staff.findOne);
router.post('/',    staff.create);
router.put('/:id',   staff.update);
router.delete('/:id', staff.delete);

module.exports = router;