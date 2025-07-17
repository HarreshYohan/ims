module.exports = (app) => {
    const user = require("../controllers/login.controller");
  
    var router = require("express").Router();

    router.post("/login", user.login);

    router.post("/signup", user.signup);

    app.use("/api",router);
  };