
const { User, Tutor } = require('../models');
const bcrypt = require('bcryptjs');
const { log } = require("console");
const { check, validationResult } = require('express-validator');

exports.create = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, email, firstname, lastname, title , contact } = req.body;

  try {
      const existingTutor = await Tutor.findOne({ where: { firstname, lastname , email} });
      const existingUser = await Tutor.findOne({ where: { email} });

      if (existingTutor || existingUser) {
        throw new Error('Email or Tutor already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newTutorData = async () => {

        const newUser = await User.create({
          username: username,
          email: email,
          password: hashedPassword,
          user_type: 'TUTOR',
          is_active: true
        });
        

        const newTutor = await Tutor.create({
          firstname: firstname,
          username: username,
          user_id: newUser.id,
          email: email,
          password: hashedPassword,
          lastname: lastname,
          title: title,
          contact: contact,
        });

        return newTutor

      }

      const result = await newTutorData();
      res.status(201).send(result);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while creating the User.'
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Tutor.findAndCountAll({
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


exports.findOne = (req, res) => {
    const id = req.params.id;
  
    Tutor.findByPk(id)
      .then(data => {
        if (data) {
          res.send(data);
        } else {
          res.status(404).send({
            message: `Cannot find tutor with id=${id}.`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving tutor with id=" + id
        });
      });
  };


exports.update = (req, res) => {
  const id = req.params.id;

  Tutor.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "tutor was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update tutor with id=${id}. Maybe tutor was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating tutor with id=" + id + "Error" + err
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
    const tutor = await Tutor.findByPk(id);
    
    if (!tutor) {
      return res.status(404).send({ message: `Cannot find Student with id=${id}.` });
    }

    await tutor.destroy({ where: { id } });

    res.send({ message: "User was deleted successfully!", tutor });

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

  const { username, password, email, firstname, lastname, title, contact } = req.body;

  try {
    const tutor = await Tutor.findByPk(id);
    
    if (!tutor) {
      return res.status(404).send({ message: `Cannot find Tutor with id=${id}.` });
    }

    const existingTutor = await Tutor.findOne({ where: { firstname, lastname, email } });

    if (existingTutor && existingTutor.id !== tutor.id) {
      throw new Error('Email or Tutor name already exists');
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : tutor.password;

    await tutor.update({
      username: username || tutor.username,
      email: email || tutor.email,
      password: hashedPassword,
      firstname: firstname || tutor.firstname,
      lastname: lastname || tutor.lastname,
      title: title || tutor.title,
      contact: contact || tutor.contact,
    });

    res.status(200).send({ message: "Tutor was updated successfully!", tutor });
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while updating the Tutor.'
    });
  }
};


