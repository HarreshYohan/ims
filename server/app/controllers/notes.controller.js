const { Notes, SubjectTutor, Subject, Grade, Student, Tutor } = require('../models');
const { check, validationResult } = require('express-validator');

// Validation rules
exports.validate = (method) => {
  switch (method) {
    case 'createNote':
    case 'updateNote': {
      return [
        check('note', 'Note is required').notEmpty(),
        check('chapter', 'Chapter is required').notEmpty(),
        check('heading', 'Heading is required').notEmpty(),
        check('subject', 'Subject is required').notEmpty(),
        check('studentid', 'Student ID is required').notEmpty(),
      ];
    }
  }
};

// Create Note
exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

   const { note, subject, heading, chapter, userid, subjecttutorid } = req.body;

  try {
    const student = await Student.findOne({where: {user_id : userid}}, {attributes: ['id']})

    const studentid = student.id
    const newNote = await Notes.create({ note, subject, heading, chapter, studentid , subjecttutorid });
    res.status(201).json(newNote);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error creating note.' });
  }
};

// Find All Notes (with pagination)
exports.findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Notes.findAndCountAll({ limit, offset });

    res.status(200).json({
      data: rows,
      totalPages: Math.ceil(count / limit),
      totalRecords: count,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Find One Note by ID
exports.findOne = async (req, res) => {
  try {
    const note = await Notes.findByPk(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found.' });

    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Note by ID
exports.update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const note = await Notes.findByPk(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found.' });

    await note.update(req.body);
    res.status(200).json({ message: 'Note updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Note by ID
exports.delete = async (req, res) => {
  try {
    const note = await Notes.findByPk(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found.' });

    await note.destroy();
    res.status(200).json({ message: 'Note deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.findByStudentAndSubject = async (req, res) => {
  const { userid, subject } = req.params;
  try {
    const student = await Student.findOne({where: {user_id : userid}}, {attributes: ['id']})

    const studentid = student.id
    const notes = await Notes.findAll({
      where: {
        studentid : studentid,
        subject: subject
      }
    });

    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNotesCountForStudent = async (req, res) => {
  const { userid } = req.params;
  const student = await Student.findOne({where: {user_id : userid}}, {attributes: ['id']})
  const studentid = student.id
  const count = await Notes.count({ where: { studentid : studentid } });
  res.json({ totalNotes: count });
};

exports.getNotesCountForTutor = async (req, res) => {
  try {
    const { id } = req.params;

    // Get Tutor record for user_id = id
    const tutor = await Tutor.findOne({
      where: { user_id: id },
      attributes: ['id']
    });

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    // Get all SubjectTutor records for this tutor
    const subjectTutors = await SubjectTutor.findAll({
      where: { tutorid: tutor.id },
      attributes: ['id']
    });

    const subjectTutorIds = subjectTutors.map(st => st.id);

    // If no subjects, count is 0
    if (subjectTutorIds.length === 0) {
      return res.json({ totalNotes: 0 });
    }

    // Count notes where subjecttutorid in array of ids
    const count = await Notes.count({
      where: { subjecttutorid: subjectTutorIds }
    });

    res.json({ totalNotes: count });

  } catch (error) {
    console.error('Error fetching notes count:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getTutorSubjectsAndGrades = async (req, res) => {
  const { userid } = req.params;
  try {
    const tutor = await Tutor.findOne({where: {user_id : userid}}, {attributes: ['id']})
    const tutorid = tutor.id
    const assignments = await SubjectTutor.findAll({
      where: { tutorid },
      include: [
        { model: Subject, as: 'subject', attributes: ['id', 'name'] },
        { model: Grade, as: 'grade', attributes: ['id', 'name'] }
      ],
      attributes: []
    });

    const subjects = [];
    const grades = [];

    assignments.forEach((a) => {
      if (!subjects.find(s => s.id === a.subject.id))
        subjects.push(a.subject);

      if (!grades.find(g => g.id === a.grade.id))
        grades.push(a.grade);
    });

    res.json({ subjects, grades });

  } catch (err) {
    console.error('Get Tutor Subjects/Grades Error:', err);
    res.status(500).json({ message: 'Failed to fetch subjects and grades' });
  }
};

exports.getNotesForApproval = async (req, res) => {
  const { userid, subject, grade } = req.query;

  try {
    const tutor = await Tutor.findOne({where: {user_id : userid}}, {attributes: ['id']})
    const tutorid = tutor.id
    const subjectTutor = await SubjectTutor.findOne({
      where: {
        tutorid: tutorid,
        subjectid: subject,
        gradeid: grade
      }
    });

    if (!subjectTutor) {
      return res.status(404).json({ message: 'Subject-Tutor mapping not found' });
    }

    const notes = await Notes.findAll({
      where: {
        subjecttutorid: subjectTutor.id,
        status: "PENDING"
      },
    });

    res.status(200).json(notes);
  } catch (err) {
    console.error('Get Notes for Approval Error:', err);
    res.status(500).json({ message: 'Failed to fetch notes for approval' });
  }
};


exports.reviewNote = async (req, res) => {
  const { id } = req.params;
  const { status, points } = req.body; // status = 'APPROVED' | 'REJECTED'

  try {
    const note = await Notes.findByPk(id);
    if (!note) return res.status(404).json({ message: 'Note not found.' });

    note.status = status;
    note.points = points;
    await note.save();

    res.status(200).json({ message: 'Note reviewed successfully.', note });

  } catch (err) {
    console.error('Review Note Error:', err);
    res.status(500).json({ message: 'Failed to review note' });
  }
};

// Controller logic for fetching approved notes
exports.getApprovedNotes = async (req, res) => {
  const { userid, subject, grade } = req.query;

  try {
    const tutor = await Tutor.findOne({where: {user_id : userid}}, {attributes: ['id']})
    const tutorid = tutor.id
    const subjectTutor = await SubjectTutor.findOne({
      where: { tutorid, subjectid: subject, gradeid: grade }
    });

    if (!subjectTutor) {
      return res.status(404).json({ message: 'Subject-Tutor mapping not found' });
    }
    const notes = await Notes.findAll({
      where: {
        subjecttutorid: subjectTutor.id,
        status: "APPROVED"
      }
    });

    res.status(200).json(notes);
  } catch (err) {
    console.error('Get Approved Notes Error:', err);
    res.status(500).json({ message: 'Failed to fetch approved notes' });
  }
};
