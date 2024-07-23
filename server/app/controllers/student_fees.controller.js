const { where } = require('sequelize');
const { StudentFees } = require('../models');


exports.create = async (req, res) => {
  try {
    const studentFee = await StudentFees.create(req.body);
    res.status(201).json(studentFee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.findAll = async (req, res) => {
  try {
    const studentFees = await StudentFees.findAll();
    res.status(200).json(studentFees);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.findOne = async (req, res) => {
  try {
    const studentFee = await StudentFees.findAll({
      where:{studentid : req.params.id}
    });
    if (studentFee) {
      res.status(200).json(studentFee);
    } else {
      res.status(404).json({ error: 'Student fee not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.update = async (req, res) => {
  try {
    const [updated] = await StudentFees.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedStudentFee = await StudentFees.findByPk(req.params.id);
      res.status(200).json(updatedStudentFee);
    } else {
      res.status(404).json({ error: 'Student fee not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.delete = async (req, res) => {
  try {
    const deleted = await StudentFees.destroy({
      where: { id: req.params.id },
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Student fee not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

