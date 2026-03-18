const { Grade } = require('../models');
const { check, validationResult } = require('express-validator');

// Validation rules
exports.validate = (method) => {
  switch (method) {
    case 'createGrade':
    case 'updateGrade': {
      return [
        check('name', 'Grade name is required').notEmpty(),
        check('name', 'Invalid grade name').isIn(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13', 'After O/L', 'After A/L', 'Pre School'])
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

exports.bulkCreate = async (req, res) => {
  const defaultGrades = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 
    'Grade 11', 'Grade 12', 'Grade 13', 'After O/L', 'After A/L', 'Pre School'
  ];

  try {
    const existingGrades = await Grade.findAll({ attributes: ['name'] });
    const existingNames = existingGrades.map(g => g.name);
    
    const toCreate = defaultGrades
      .filter(name => !existingNames.includes(name))
      .map(name => ({ name }));

    if (toCreate.length === 0) {
      return res.status(200).send({ message: 'All default grades already exist.' });
    }

    await Grade.bulkCreate(toCreate);
    res.status(201).send({ message: `${toCreate.length} default grades created.` });
  } catch (err) {
    res.status(500).send({ message: err.message || 'Error creating default grades.' });
  }
};
