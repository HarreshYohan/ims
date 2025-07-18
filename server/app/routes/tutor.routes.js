module.exports = (app) => {
  const tutor = require("../controllers/tutor.controller.js");

  var router = require("express").Router();

  router.get("/all", tutor.findAll);

  router.get("/:id", tutor.findOne);

  router.post("/", tutor.create);

  router.put('/:id', tutor.update);

  router.get('/subject-mapping/:id', tutor.getSubjectMapping);

  router.post('/add-subject', tutor.addSubjectToTutor);

  router.delete('/remove-subject/:tutorid/:mappingid', tutor.removeSubject);

  router.get('/grades/all', tutor.getAllGrades);

  router.get('/subjects/:gradeid', tutor.getSubjectsByGrade);

  app.use('/api/tutor', router);
};