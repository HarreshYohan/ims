const router = require('express').Router();
const profile = require('../controllers/profile.controller');

router.get('/:id',  profile.getProfile);
router.post('/:id', profile.updateProfile);

module.exports = router;