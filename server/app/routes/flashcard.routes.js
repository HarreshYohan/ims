const router = require('express').Router();
const flashcard = require('../controllers/flashcard.controller');

router.post('/', flashcard.create);
router.post('/generate/:noteid', flashcard.generateFromNote);
router.get('/student/:userid', flashcard.findByStudent);
router.get('/due/:userid', flashcard.getDueCards);
router.get('/stats/:userid', flashcard.getStats);
router.put('/:id/review', flashcard.reviewCard);
router.delete('/:id', flashcard.delete);

module.exports = router;
