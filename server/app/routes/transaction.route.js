module.exports = (app) => {
    const transaction = require("../controllers/transaction.controller.js");
  
    var router = require("express").Router();
  
    router.get("/all", transaction.findAll);
  
    router.get("/:id", transaction.findOne);
  
    router.post("/", transaction.create);
  
    app.use('/api/transaction', router);
  };