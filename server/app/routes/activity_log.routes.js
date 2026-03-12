const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/activity_log.controller');

router.get('/all', ctrl.findAll);
router.get('/stats', ctrl.stats);

module.exports = router;
