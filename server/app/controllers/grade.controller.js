const { Grade } = require('../models');
const { check, validationResult } = require('express-validator');

// Validation rules
exports.validate = (method) => {
  switch (method) {
    case 'createGrade':
    case 'updateGrade': {
      return [
        check('name', 'Grade name is required').notEmpty(),
        check('name', 'Invalid Grade format. Use "Grade X" or "Class X" (e.g., Grade 10, Class 5A)').matches(/^(Grade|Class)\s*[0-9]+[A-Z]?$/i)
      ];
    }
  }
};


exports.create = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body;

  try {
    const grade = await Grade.create({ name });
    res.status(201).send(grade);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(400).send({
        message: 'Grade name already exists.'
      });
    } else {
      res.status(500).send({
        message: err.message || 'Some error occurred while creating the Grade.'
      });
    }
  }
};


exports.findAll = async (req, res) => {
  try {
    const grades = await Grade.findAll();
    res.status(200).send(grades);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while retrieving grades.'
    });
  }
};


exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const grade = await Grade.findByPk(id);
    if (!grade) {
      return res.status(404).send({ message: `Cannot find Grade with id=${id}.` });
    }
    res.status(200).send(grade);
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving Grade with id=${id}`
    });
  }
};


exports.update = async (req, res) => {
  const id = req.params.id;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body;

  try {
    const grade = await Grade.findByPk(id);
    if (!grade) {
      return res.status(404).send({ message: `Cannot find Grade with id=${id}.` });
    }

    await Grade.update({ name }, { where: { id } });
    res.status(200).send({ message: "Grade was updated successfully." });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(400).send({
        message: 'Grade name already exists.'
      });
    } else {
      res.status(500).send({
        message: `Error updating Grade with id=${id}`
      });
    }
  }
};


exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const grade = await Grade.findByPk(id);
    if (!grade) {
      return res.status(404).send({ message: `Cannot find Grade with id=${id}.` });
    }

    await grade.destroy();
    res.status(200).send({ message: "Grade was deleted successfully!" });
  } catch (err) {
    res.status(500).send({
      message: `Could not delete Grade with id=${id} err ${err}`
    });
  }
};
