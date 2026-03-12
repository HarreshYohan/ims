const router = require('express').Router();
const transaction = require('../controllers/transaction.controller');

router.get('/all',          transaction.findAll);
router.get('/download/all', transaction.downloadAll);
router.get('/:id',          transaction.findOne);
router.post('/',            transaction.create);

module.exports = router;
