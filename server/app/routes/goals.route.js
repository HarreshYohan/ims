module.exports = (app) => {
   const goalController = require('../controllers/goals.controller');
  
    var router = require("express").Router();
  
    router.get('/:studentId', goalController.getGoalsByStudent);

    router.post('/', goalController.createGoal);

    router.put('/:id', goalController.updateGoal);

    router.delete('/:id', goalController.deleteGoal);

    router.get('/active-count/:studentid', goalController.getActiveGoalsCount);

    router.get('/tutor/goals', goalController.getGoalsByTutorSubjectGrade);

    router.put('/tutor/update-goal/:id', goalController.updateGoalProgress);

    router.get('/active-count-tutor/:userid', goalController.getActiveTutorGoalsCount);
  
    app.use('/api/goals', router);
  };