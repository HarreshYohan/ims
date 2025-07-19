module.exports = (app) => {
  const timetable = require("../controllers/timetable.controller.js");

  var router = require("express").Router();

  router.get("/all", timetable.findAll);

  router.get("/:id", timetable.findOne);

  router.delete("/:id", timetable.delete);

  router.post("/", timetable.create);

  router.get('/student/:studentid', timetable.findForStudent);

  router.get('/tutor/:userid', timetable.findForTutor);

  router.get('/student-count/:studentid', timetable.getClassCount);

  router.get('/tutor-count/:tutorid', timetable.getTutorClassCount);



  app.use('/api/timetable', router);
};