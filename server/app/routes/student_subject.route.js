module.exports = (app) => {
    const student_subject = require("../controllers/student_subject.controller");
  
    var router = require("express").Router();
  
    router.get("/all", student_subject.findAll);
  
    router.get("/:id", student_subject.findOne);
  
    router.delete("/:id", student_subject.delete);
  
    router.post("/", student_subject.create);

    router.get('/subjects/:studentid', student_subject.getSubjectsForStudentGrade);

    router.post("/add-subject", student_subject.addSubjectToStudent);

    router.delete("/remove-subject/:studentid/:subjectid", student_subject.removeSubjectFromStudent);

  
    app.use('/api/student-subject', router);
  };