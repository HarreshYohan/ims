module.exports = (app) => {
  
    var router = require("express").Router();
  
    const chatroom = require("../controllers/chatroom.controller");

    router.post("/", chatroom.create);

    router.get("/", chatroom.findAll);  
    
    router.get("/:id", chatroom.findOne);
  
    app.use('/api/chatroom', router);
  };
