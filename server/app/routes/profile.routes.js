module.exports = (app) => {
    const profile = require("../controllers/profile.controller.js");
  
    var router = require("express").Router();
  
    router.get("/:id", profile.getProfile);

    router.post("/:id", profile.updateProfile);
  
    app.use('/api/profile', router);
  };