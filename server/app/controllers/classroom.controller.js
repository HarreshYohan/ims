const { Classroom, Timetable } = require('../models');
const { check, validationResult } = require('express-validator');
const { TimetableData } = require('../helpers/helpers.js')


exports.validate = (method) => {
  switch (method) {
    case 'createClasroom':
    case 'updateClasroom': {
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

  const { name, capacity } = req.body;

  try {

      const existingClassroom = await Classroom.findOne({ where: { name } });

      if (existingClassroom) {
        throw new Error('Classroom already exists');
      }

      const newClassroom = async () => {

        const classroom = await Classroom.create({
          name: name,
          capacity: capacity
        });

        TimetableData.forEach(async slot => { 
             await Timetable.create({
              timeslotid : slot.id,
              timeslot: slot.timeslot,
              classroomid: classroom.id
            });
            
          });


        return classroom
      }
      const result = await newClassroom();
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while creating the Classroom.'
    });
  }
};



exports.findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Classroom.findAndCountAll({
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


exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const classroom = await Classroom.findByPk(id);
    if (!classroom) {
      return res.status(404).send({ message: `Cannot find Classroom with id=${id}.` });
    }
    res.status(200).send(classroom);
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving Classroom with id=${id}`
    });
  }
};


exports.update = async (req, res) => {
  const id = req.params.id;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name , capacity} = req.body;

  try {
    const classroom = await Classroom.findByPk(id);
    if (!Classroom) {
      return res.status(404).send({ message: `Cannot find Classroom with id=${id}.` });
    }

    await Classroom.update({ name, capacity });
    res.status(200).send({ message: "Classroom was updated successfully." });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(400).send({
        message: 'Classroom name already exists.'
      });
    } else {
      res.status(500).send({
        message: `Error updating Classroom with id=${id}`
      });
    }
  }
};


exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const classroom = await Classroom.findByPk(id);
    if (!classroom) {
      return res.status(404).send({ message: `Cannot find Classroom with id=${id}.` });
    }

    await Classroom.destroy();
    res.status(200).send({ message: "Classroom was deleted successfully!" });
  } catch (err) {
    res.status(500).send({
      message: `Could not delete Classroom with id=${id}`
    });
  }
};
