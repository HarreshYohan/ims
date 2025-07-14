module.exports = (app) => {
   const goalController = require('../controllers/goals.controller');
  
    var router = require("express").Router();
  
    router.get('/:studentId', goalController.getGoalsByStudent);
    router.post('/', goalController.createGoal);
    router.put('/:id', goalController.updateGoal);
    router.delete('/:id', goalController.deleteGoal);
  
    app.use('/api/goals', router);
  };