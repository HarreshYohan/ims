
const { User, Staff } = require('../models');
const bcrypt = require('bcryptjs');
const { log } = require("console");
const { check, validationResult } = require('express-validator');


exports.validate = (method) => {
  switch (method) {
    case 'createStaff': {
      return [
        check('firstname', 'firstname is required').notEmpty(),
        check('username', 'username is required').notEmpty(),
        check('lastname', 'lastname is required').notEmpty(),
        check('title', 'title is required').notEmpty(),
        check('position', 'position is required').notEmpty(),
        check('contact', 'contact is required').notEmpty(),
        check('email', 'Invalid email').isEmail(),
        check('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
      ];
    }
  }
};

exports.findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Staff.findAndCountAll({
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      data: rows,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.create = async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, email, firstname, lastname, title, contact, position, salary } = req.body;

  try {

      const existingStaff = await Staff.findOne({ where: { firstname, lastname } });
      const existingUser = await User.findOne({ where: { email } });

      if (existingStaff || existingUser) {
        throw new Error('Email or Staff already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newStaffData = async () => {
        const newUser = await User.create({
          username: username,
          email: email,
          password: hashedPassword,
          user_type: 'STAFF',
          is_active: true
        });

        const newStaff = await Staff.create({
          username: username,
          email: email,
          user_id: newUser.id,
          password: hashedPassword,
          firstname: firstname,
          lastname: lastname,
          position: position,
          title: title,
          contact: contact,
          salary: salary
        });

        return newStaff
      }
      const result = await newStaffData();
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while creating the User.'
    });
  }
};

exports.findOne = (req, res) => {
  const id = req.params.id;

  Staff.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find staff with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving staff with id=" + id
      });
    });
};


exports.delete = async (req, res) => {
  const id = req.params.id;
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const staff = await Staff.findByPk(id);
    
    if (!staff) {
      return res.status(404).send({ message: `Cannot find Staff with id=${id}.` });
    }

    await Staff.destroy({ where: { id } });

    res.send({ message: "User was deleted successfully!", staff });

  } catch (err) {
    res.status(500).send({ message: `Could not delete User with id=${id}: ${err.message}` });
  }
};


exports.update = async (req, res) => {
  const id = req.params.id; 
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, email, firstname, lastname, title, contact, position } = req.body;

  try {
    const staff = await Staff.findByPk(id);
    
    if (!staff) {
      return res.status(404).send({ message: `Cannot find Staff with id=${id}.` });
    }

    const existingStaff = await Staff.findOne({ where: { firstname, lastname , email} });

    if ((existingStaff && existingStaff.id !== staff.id)) {
      throw new Error('Email or Tutor name already exists');
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : staff.password;

    await staff.update({
      username: username || staff.username,
      email: email || staff.email,
      password: hashedPassword,
      firstname: firstname || staff.firstname,
      lastname: lastname || staff.lastname,
      title: title || staff.title,
      contact: contact || staff.contact,
      position: position || staff.position,
    });

    res.status(200).send({ message: "Staff was updated successfully!", staff });
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while updating the Staff.'
    });
  }
};
