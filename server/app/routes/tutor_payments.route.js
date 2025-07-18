module.exports = (app) => {
  const tutorPaymentController = require('../controllers/tutor_payment.controller');

  var router = require("express").Router();

    router.post('/', tutorPaymentController.createPayment);

    router.get('/', tutorPaymentController.getAllPayments);

    router.delete('/:id', tutorPaymentController.deletePayment);

    router.post('/calculate-save', tutorPaymentController.calculateAndSaveTutorPayment);

    router.post('/update-status', tutorPaymentController.updatePayment);

    router.get('/summary', tutorPaymentController.getTutorPaymentSummary);


  app.use('/api/tutor-payment', router);
};
