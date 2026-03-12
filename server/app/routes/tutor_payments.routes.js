const router = require('express').Router();
const tutorPayment = require('../controllers/tutor_payment.controller');

router.get('/summary',           tutorPayment.getTutorPaymentSummary);
router.get('/',                  tutorPayment.getAllPayments);
router.post('/',                 tutorPayment.createPayment);
router.post('/calculate-save',   tutorPayment.calculateAndSaveTutorPayment);
router.post('/update-status',    tutorPayment.updatePayment);
router.delete('/:id',            tutorPayment.deletePayment);

module.exports = router;
