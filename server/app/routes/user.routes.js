module.exports = (app) => {
    const user = require("../controllers/user.controller.js");
  
    var router = require("express").Router();

    router.get("/all", user.findAll);

    router.post("/", user.create);

    router.get("/:id", user.findOne);

    router.put("/:id", user.update);

    router.delete("/:id", user.delete);
  
    app.use('/api/user', router);
  };