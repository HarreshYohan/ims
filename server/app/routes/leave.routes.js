const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave.controller.js');
const authMiddleware = require('../middleware/auth.js');

router.use(authMiddleware);

router.post('/', leaveController.create);
router.get('/', leaveController.findAll);
router.put('/:id/status', leaveController.updateStatus);

module.exports = router;
