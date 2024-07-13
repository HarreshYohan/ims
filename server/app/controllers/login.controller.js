const db = require("../models");
const User = db.users;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helpers = require('../helpers/validations');
require('dotenv')

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!helpers.isValidObject(req.body)) {
      return res.status(401).send({ message: "Input is invalid. Some elements are null or empty." });
    }

    if (!(email && password)) {
        res.status(401).send("Enter correct email & password");
        
    }
    const user = await User.findOne({
        where: { email: email }
      });
      console.log(password, user)
    if (user && ( await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
          { user_id: user.id, email:user.email, user_type :user.user_type },
          process.env.SECRET_KEY,
          {
            expiresIn: "2m",
          }
        );

        user.token = token;

        res.status(200).json({ message: 'Login endpoint reached', token: token , user: user});
    }
    else{
        res.status(401).send({message :"Invalid Credentials"});
    }
};



exports.signup = async (req, res) => {

  if (!helpers.isValidObject(req.body)) {
    return res.status(401).send({ message: "Input is invalid. Some elements are null or empty." });
  }
  const saltRounds = 10;
  const hashedPassword = bcrypt.hashSync(req.body.password, saltRounds);

  try {
    const existingUser = await User.findOne({
      where: { email: req.body.email }
    });

    if (existingUser) {
      return res.status(401).send({ message: "User with this email already exists. Try with another email." });
    }

    const user = {
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email,
      user_type: req.body.user_type ?? "NA"
    };

    const createdUser = await User.create(user);

    if (createdUser) {
      var token = jwt.sign(
        { user_id: createdUser.id, email:createdUser.email, user_type :createdUser.user_type },
        process.env.SECRET_KEY,
        {
          expiresIn: "2m",
        }
      );
    }

    res.status(200).json({ message: 'Succusfully signedup', token: token , user: createdUser});
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the User."
    });
  }
};