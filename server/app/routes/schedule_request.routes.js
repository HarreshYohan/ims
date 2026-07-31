const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule_request.controller.js');
const authMiddleware = require('../middleware/auth.js');

router.use(authMiddleware);

// Tutor fetches their own pending requests
router.get('/tutor', scheduleController.findForTutor);

// Admin fetches all requests
router.get('/admin', scheduleController.findAllAdmin);

// Tutor approves or rejects
router.put('/tutor/:id', scheduleController.tutorAction);

// Admin approves or rejects tutor's proposal
router.put('/admin/:id', scheduleController.adminAction);

module.exports = router;
