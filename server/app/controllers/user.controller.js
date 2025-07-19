const { User, Student } = require('../models');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

// Validation rules
exports.validate = (method) => {
  switch (method) {
    case 'createUser': {
      return [
        check('username', 'Username is required').notEmpty(),
        check('email', 'Invalid email').isEmail(),
        check('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
        check('user_type', 'Invalid user type').isIn(['ADMIN', 'STUDENT', 'TUTOR', 'NA', 'STAFF'])
      ];
    }
    case 'updateUser': {
      return [
        check('username', 'Username is required').optional().notEmpty(),
        check('email', 'Invalid email').optional().isEmail(),
        check('password', 'Password must be at least 6 characters long').optional().isLength({ min: 6 }),
        check('user_type', 'Invalid user type').optional().isIn(['ADMIN', 'STUDENT', 'TUTOR', 'NA', 'STAFF'])
      ];
    }
    case 'findUser': {
      return [
        check('id', 'Invalid ID').isInt({ gt: 0 })
      ];
    }
  }
};

// Retrieve all Users from the database
exports.findAll = async (req, res) => {
  try {
    const { count, rows } = await User.findAndCountAll({
    });

    res.json({
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.findOne = (req, res) => {
  const id = req.params.id;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  User.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({ message: `Cannot find User with id=${id}.` });
      }
    })
    .catch(err => res.status(500).send({ message: `Error retrieving User with id=${id}: ${err.message}` }));
};


exports.create = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, email, user_type } = req.body;

  try {

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      username,
      password: hashedPassword,
      email,
      user_type
    };

    const newUser = await User.create(user);

    res.status(201).send(newUser);
  } catch (err) {
    res.status(500).send({ message: err.message || "Some error occurred while creating the User." });
  }
};


exports.update = async (req, res) => {
  const id = req.params.id;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send({ message: `Cannot find User with id=${id}.` });
    }

    const { password } = req.body;
    if (password) {
      req.body.password = await bcrypt.hash(password, 10);
    }

    // Update User
    await User.update(req.body, { where: { id } });
    res.send({ message: "User was updated successfully." });
  } catch (err) {
    res.status(500).send({ message: `Error updating User with id=${id}: ${err.message}` });
  }
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send({ message: `Cannot find User with id=${id}.` });
    }

    await User.destroy({ where: { id } });
    res.send({ message: "User was deleted successfully!" });
  } catch (err) {
    res.status(500).send({ message: `Could not delete User with id=${id}: ${err.message}` });
  }
};


