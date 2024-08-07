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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Welcome route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Institue Management System application." });
});

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

const PORT = process.env.APP_PORT || 8083;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
