const { Subject } = require('../models');
const { check, validationResult } = require('express-validator');

// Validation rules
exports.validate = (method) => {
  switch (method) {
    case 'createSubject':
    case 'updateSubject': {
      return [
        check('name', 'Name is required').notEmpty()
      ];
    }
  }
};


exports.create = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body;

  try {
    const subject = await Subject.create({ name });
    res.status(201).send(subject);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(400).send({
        message: 'Subject name already exists.'
      });
    } else {
      res.status(500).send({
        message: err.message || 'Some error occurred while creating the Subject.'
      });
    }
  }
};

exports.findAll = async (req, res) => {
  try {

    const { rows } = await Subject.findAndCountAll({
    });

    res.json({
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Find a single Subject by ID
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const subject = await Subject.findByPk(id);
    if (!subject) {
      return res.status(404).send({ message: `Cannot find Subject with id=${id}.` });
    }
    res.status(200).send(subject);
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving Subject with id=${id}`
    });
  }
};

// Update a Subject by the ID in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body;

  try {
    const subject = await Subject.findByPk(id);
    if (!subject) {
      return res.status(404).send({ message: `Cannot find Subject with id=${id}.` });
    }

    await subject.update({ name });
    res.status(200).send({ message: "Subject was updated successfully." });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(400).send({
        message: 'Subject name already exists.'
      });
    } else {
      res.status(500).send({
        message: `Error updating Subject with id=${id} Error ${err}`
      });
    }
  }
};

// Delete a Subject with the specified ID in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const subject = await Subject.findByPk(id);
    if (!subject) {
      return res.status(404).send({ message: `Cannot find Subject with id=${id}.` });
    }

    await subject.destroy();
    res.status(200).send({ message: "Subject was deleted successfully!" });
  } catch (err) {
    res.status(500).send({
      message: `Could not delete Subject with id=${id} Error ${err}`
    });
  }
};
