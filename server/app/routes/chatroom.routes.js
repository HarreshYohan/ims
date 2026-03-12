const router = require('express').Router();
const chatroom = require('../controllers/chatroom.controller');

router.get('/',     chatroom.findAll);
router.get('/:id',  chatroom.findOne);
router.post('/',    chatroom.create);

module.exports = router;
