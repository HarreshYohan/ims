const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const fs = require('fs');
const path = require('path');
const authenticateUser = require("./app/middleware/auth");
require("dotenv").config(); 

const app = express();

const db = require("./app/models");

db.sequelize.sync()
  .then(() => {
    console.log("Database synchronized.");
    // runMigrations();
  })
  .catch((err) => {
    console.error("Failed to sync database:", err.message);
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Welcome route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Institue Management System application." });
});

// Dynamically load routers from the 'app/routes' directory
const routerDir = path.join(__dirname, 'app', 'routes');
const routerFiles = fs.readdirSync(routerDir);

routerFiles.forEach((file) => {

  if (file.endsWith('.js')) {
    const router = require(path.join(routerDir, file));
    const isLoginRouter = file.toLowerCase().includes('login');
    
    if(! isLoginRouter){
      app.use(authenticateUser);
    }
    router(app);  
  }
});

const PORT = process.env.APP_PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
