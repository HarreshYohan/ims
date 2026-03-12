const router = require('express').Router();
const studentFees = require('../controllers/student_fees.controller');

router.get('/all',           studentFees.findAll);
router.get('/summary/:id',   studentFees.getStudentFeesSummary);
router.get('/last-paid/:id', studentFees.getNextPaymentDate);
router.get('/:id',           studentFees.findOne);
router.post('/',             studentFees.create);
router.put('/:id',           studentFees.update);
router.delete('/:id',        studentFees.delete);

module.exports = router;
