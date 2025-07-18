module.exports = (app) => {
  const notes = require("../controllers/notes.controller.js");

  var router = require("express").Router();

  router.get("/all", notes.findAll);

  router.get("/:id", notes.findOne);

  router.delete("/:id", notes.delete);

  router.post("/", notes.create);

  router.put("/:id", notes.update);

  router.get("/student/:studentid/:subject", notes.findByStudentAndSubject);

  router.get("/count/:studentid", notes.getNotesCountForStudent);

  router.get("/count-tutor/:id", notes.getNotesCountForTutor);

  router.get('/subjects-grades/:tutorid', notes.getTutorSubjectsAndGrades);

  router.get('/tutor/notes-for-approval', notes.getNotesForApproval);

  router.put('/tutor/review-note/:id', notes.reviewNote);

  app.use('/api/notes', router);
};
