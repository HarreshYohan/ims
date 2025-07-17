module.exports = (app) => {
  
    var router = require("express").Router();
  
    const student_fees = require("../controllers/student_fees.controller");

    router.post("/", student_fees.create);
    
    router.get("/all", student_fees.findAll);
    
    router.get("/:id", student_fees.findOne);
    
    router.put("/:id", student_fees.update);
    
    router.delete("/:id", student_fees.delete);

    router.get("/summary/:id", student_fees.getStudentFeesSummary);

    router.get("/last-paid/:id", student_fees.getNextPaymentDate);
  
    app.use('/api/student-fees', router);
  };
