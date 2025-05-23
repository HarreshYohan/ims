const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {


  if (!req.headers.authorization ) {
    return next();
    // return res.status(403).send("A token is required for authentication");
  }

  const token =  req.headers.authorization.split(' ')[1] ;

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message : err});
    }
    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;
