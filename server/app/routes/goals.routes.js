const router = require('express').Router();
const goals = require('../controllers/goals.controller');

router.get('/active-count-tutor/:userid', goals.getActiveTutorGoalsCount);
router.get('/active-count/:studentid',    goals.getActiveGoalsCount);
router.get('/tutor/goals',                goals.getGoalsByTutorSubjectGrade);
router.put('/tutor/update-goal/:id',      goals.updateGoalProgress);
router.get('/:studentId',                 goals.getGoalsByStudent);
router.post('/',                          goals.createGoal);
router.put('/:id',                        goals.updateGoal);
router.delete('/:id',                     goals.deleteGoal);

module.exports = router;
