const { Timetable, Classroom , SubjectTutor, Subject, Grade, Tutor, Student, StudentSubject} = require('../models');
const { check, validationResult } = require('express-validator');
const { TimetableData } = require('../helpers/helpers');
const { Op } = require('sequelize');

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

  const { timeslotid, classroomid, subjecttutorid, day } = req.body;

  try {
    const timeslot = TimetableData.find(slot => slot.id == timeslotid)?.timeslot || null;

    if (!timeslot) {
      return res.status(400).send({ message: 'Invalid timeslotid.' });
    }

    const subjectTutor = await SubjectTutor.findByPk(subjecttutorid);
    if (!subjectTutor) {
      return res.status(400).send({ message: 'Invalid subjecttutorid.' });
    }


    let timetable = await Timetable.findOne({
      where: {
        classroomid: classroomid,
        timeslotid: timeslotid
      }
    });

    if (timetable) {
      timetable[day] = subjecttutorid;
      await timetable.save();
    } 
    else {
      const newTimetable = {
        timeslotid: timeslotid,
        timeslot: timeslot,
        classroomid: classroomid,
        [day]: subjecttutorid
      };
      timetable = await Timetable.create(newTimetable);
    }

    res.status(201).send(timetable);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(400).send({
        message: 'Timetable entry already exists.'
      });
    } else {
      res.status(500).send({
        message: err.message || 'Some error occurred while creating the Timetable.'
      });
    }
  }
};



exports.findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Timetable.findAndCountAll({
        include: [
            { model: Classroom,  as: 'classroom' },
            {
                model: SubjectTutor,
                as: 'mondaycls',
                include: [
                    { model: Subject, as: 'subject' },
                    { model: Tutor, as: 'tutor' },
                    { model: Grade, as: 'grade' },
                ],
            },
            {
                model: SubjectTutor,
                as: 'tuesdaycls',
                include: [
                    { model: Subject, as: 'subject' },
                    { model: Tutor, as: 'tutor' },
                    { model: Grade, as: 'grade' },
                ],
            },
            {
                model: SubjectTutor,
                as: 'wednesdaycls',
                include: [
                    { model: Subject, as: 'subject' },
                    { model: Tutor, as: 'tutor' },
                    { model: Grade, as: 'grade' },
                ],
            },
            {
                model: SubjectTutor,
                as: 'thursdaycls',
                include: [
                    { model: Subject, as: 'subject' },
                    { model: Tutor, as: 'tutor' },
                    { model: Grade, as: 'grade' },
                ],
            },
            {
                model: SubjectTutor,
                as: 'fridaycls',
                include: [
                    { model: Subject, as: 'subject' },
                    { model: Tutor, as: 'tutor' },
                    { model: Grade, as: 'grade' },
                ],
            },
            {
                model: SubjectTutor,
                as: 'saturdaycls',
                include: [
                    { model: Subject, as: 'subject' },
                    { model: Tutor, as: 'tutor' },
                    { model: Grade, as: 'grade' },
                ],
            },
            {
                model: SubjectTutor,
                as: 'sundaycls',
                include: [
                    { model: Subject, as: 'subject' },
                    { model: Tutor, as: 'tutor' },
                    { model: Grade, as: 'grade' },
                ],
            },
          ],
          order: [
            ['id', 'ASC'],
        ],
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

// Find a single Timetable by ID
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const Timetable = await Timetable.findByPk(id);
    if (!Timetable) {
      return res.status(404).send({ message: `Cannot find Timetable with id=${id}.` });
    }
    res.status(200).send(Timetable);
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving Timetable with id=${id}`
    });
  }
};

// Update a Timetable by the ID in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body;

  try {
    const timetable = await Timetable.findByPk(id);
    if (!timetable) {
      return res.status(404).send({ message: `Cannot find Timetable with id=${id}.` });
    }

    await Timetable.update({ name });
    res.status(200).send({ message: "Timetable was updated successfully." });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(400).send({
        message: 'Timetable name already exists.'
      });
    } else {
      res.status(500).send({
        message: `Error updating Timetable with id=${id} Error ${err}`
      });
    }
  }
};


exports.delete = async (req, res) => {
  const id = req.params.id;
  const { day, timeslotid } = req.query;
  try {
    const timetable = await Timetable.findOne({ where: { classroomid: id, timeslotid: timeslotid } });
    if (!timetable) {
      return res.status(404).send({ message: `Cannot find Timetable with id=${id}.` });
    }

    const updateData = {};
    updateData[day] = null;
    
    const result = await timetable.update(updateData);

    res.status(200).send({ message: `Timetable  for ${day} ${timetable.timeslot} was deleted successfully!` });
  } catch (err) {
    res.status(500).send({
      message: `Could not delete Timetable with id=${id} Error ${err}`
    });
  }
};

const getStudentTimetableRecords = async (studentId) => {
    const studentSubjects = await StudentSubject.findAll({
      where: {
        studentid: studentId,
      },
      attributes: ['subjecttutorid'], 
    });
const subjectTutorIds = studentSubjects.map(subject => subject.subjecttutorid);

const rawTimetable = await Timetable.findAll({
  include: [
    {
      model: SubjectTutor,
      as: 'mondaycls',
      include: [{ model: Subject, as: 'subject', attributes: ['name'] }]
    },
    {
      model: SubjectTutor,
      as: 'tuesdaycls',
      include: [{ model: Subject, as: 'subject', attributes: ['name'] }]
    },
    {
      model: SubjectTutor,
      as: 'wednesdaycls',
      include: [{ model: Subject, as: 'subject', attributes: ['name'] }]
    },
    {
      model: SubjectTutor,
      as: 'thursdaycls',
      include: [{ model: Subject, as: 'subject', attributes: ['name'] }]
    },
    {
      model: SubjectTutor,
      as: 'fridaycls',
      include: [{ model: Subject, as: 'subject', attributes: ['name'] }]
    },
    {
      model: SubjectTutor,
      as: 'saturdaycls',
      include: [{ model: Subject, as: 'subject', attributes: ['name'] }]
    },
    {
      model: SubjectTutor,
      as: 'sundaycls',
      include: [{ model: Subject, as: 'subject', attributes: ['name'] }]
    },
  ],
  order: [['timeslotid', 'ASC']],
    });

    const result = [];

    const days = [
      { key: "monday", cls: "mondaycls" },
      { key: "tuesday", cls: "tuesdaycls" },
      { key: "wednesday", cls: "wednesdaycls" },
      { key: "thursday", cls: "thursdaycls" },
      { key: "friday", cls: "fridaycls" },
      { key: "saturday", cls: "saturdaycls" },
      { key: "sunday", cls: "sundaycls" },
    ];

rawTimetable.forEach(entry => {
    days.forEach(({ key, cls }) => {
      const subjectTutorId = entry[key];
      if (subjectTutorIds.includes(subjectTutorId)) {
        const subjectName = entry[cls]?.subject?.name;
        if (subjectName) {
          result.push({
            timeslot: entry.timeslot,
            day: key,
            subject: subjectName,
          });
        }
      }
    });
    });

  return result;
};


exports.findForStudent = async (req, res) => {
  const studentId = req.params.studentid;
  try {
    const records = await getStudentTimetableRecords(studentId);
    res.json({ data: records });
  } catch (err) {
    console.error('Student timetable fetch failed:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.findForTutor = async (req, res) => {
  const tutorId = req.params.tutorid;

  try {
    const subjectTutors = await SubjectTutor.findAll({ where: { tutorid: tutorId } });
    const subjectTutorIds = subjectTutors.map(st => st.id);

    if (subjectTutorIds.length === 0) {
      return res.status(404).json({ message: 'No subjects assigned to this tutor.' });
    }

  const rawTimetable = await Timetable.findAll({
  include: [
    {
      model: SubjectTutor,
      as: 'mondaycls',
      include: [{ model: Subject, as: 'subject', attributes: ['name'] }]
    },
    {
      model: SubjectTutor,
      as: 'tuesdaycls',
      include: [{ model: Subject, as: 'subject', attributes: ['name'] }]
    },
    {
      model: SubjectTutor,
      as: 'wednesdaycls',
      include: [{ model: Subject, as: 'subject', attributes: ['name'] }]
    },
    {
      model: SubjectTutor,
      as: 'thursdaycls',
      include: [{ model: Subject, as: 'subject', attributes: ['name'] }]
    },
    {
      model: SubjectTutor,
      as: 'fridaycls',
      include: [{ model: Subject, as: 'subject', attributes: ['name'] }]
    },
    {
      model: SubjectTutor,
      as: 'saturdaycls',
      include: [{ model: Subject, as: 'subject', attributes: ['name'] }]
    },
    {
      model: SubjectTutor,
      as: 'sundaycls',
      include: [{ model: Subject, as: 'subject', attributes: ['name'] }]
    },
  ],
  order: [['timeslotid', 'ASC']],
    });


    const result = [];

    const days = [
      { key: "monday", cls: "mondaycls" },
      { key: "tuesday", cls: "tuesdaycls" },
      { key: "wednesday", cls: "wednesdaycls" },
      { key: "thursday", cls: "thursdaycls" },
      { key: "friday", cls: "fridaycls" },
      { key: "saturday", cls: "saturdaycls" },
      { key: "sunday", cls: "sundaycls" },
    ];

    rawTimetable.forEach(entry => {
    days.forEach(({ key, cls }) => {
      const subjectTutorId = entry[key];
      if (subjectTutorIds.includes(subjectTutorId)) {
        const subjectName = entry[cls]?.subject?.name;
        if (subjectName) {
          result.push({
            timeslot: entry.timeslot,
            day: key,
            subject: subjectName,
          });
        }
      }
    });
    });

    res.json({ data: result });
  } catch (err) {
    console.error('Student timetable fetch failed:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getClassCount = async (req, res) => {
  const studentId = req.params.studentid;
  try {
    const records = await getStudentTimetableRecords(studentId);
    res.json({ data: records.length });
  } catch (err) {
    console.error('Student timetable fetch failed:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getTutorClassCount = async (req, res) => {
  const tutorId = req.params.tutorid;
  try {
    const subjectTutors = await SubjectTutor.findAll({ where: { tutorid: tutorId } });
    const subjectTutorIds = subjectTutors.map(st => st.id);

    if (subjectTutorIds.length === 0) {
      return res.json({ data: 0 });
    }

    const rawTimetable = await Timetable.findAll();

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    let classCount = 0;

    rawTimetable.forEach(entry => {
      days.forEach(day => {
        const subjectTutorId = entry[day];
        if (subjectTutorIds.includes(subjectTutorId)) {
          classCount++;
        }
      });
    });

    res.json({ data: classCount });

  } catch (err) {
    console.error('Tutor class count fetch failed:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
