const { Syllabus } = require('../models');
const logger = require('../lib/logger');

exports.findAll = async (req, res) => {
  try {
    const data = await Syllabus.findAll({
      order: [['name', 'ASC']]
    });
    res.json(data);
  } catch (err) {
    logger.error('Error fetching syllabuses:', err);
    res.status(500).json({ message: err.message || 'Error fetching syllabuses' });
  }
};

exports.findOne = async (req, res) => {
  try {
    const data = await Syllabus.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: 'Syllabus not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    
    const duplicate = await Syllabus.findOne({ where: { name } });
    if (duplicate) return res.status(409).json({ message: 'Syllabus already exists' });

    const newSyllabus = await Syllabus.create({ name });
    res.status(201).json(newSyllabus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await Syllabus.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: 'Syllabus not found' });

    await data.update(req.body);
    res.json({ message: 'Syllabus updated successfully', data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const data = await Syllabus.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: 'Syllabus not found' });

    await data.destroy();
    res.json({ message: 'Syllabus deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
