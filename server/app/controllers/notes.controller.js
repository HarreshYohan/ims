const { Notes, SubjectTutor, Subject, Grade } = require('../models');
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

  const { note, subject, heading, chapter, studentid, subjecttutorid } = req.body;

  try {
    const newNote = await Notes.create({ note, subject, heading, chapter, studentid, subjecttutorid });
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
  const { studentid, subject } = req.params;
  try {
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
  const { studentid } = req.params;
  const count = await Notes.count({ where: { studentid : studentid } });
  res.json({ totalNotes: count });
};

exports.getNotesCountForTutor = async (req, res) => {
  const { id } = req.params;
  const count = await Notes.count({ where: { subjecttutorid : id } });
  res.json({ totalNotes: count });
};

exports.getTutorSubjectsAndGrades = async (req, res) => {
  const { tutorid } = req.params;
  try {
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
  const { tutorid, subject, grade } = req.query;

  try {
    // Find the subjecttutor record matching tutorid and subject
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
        status: "Pending"
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
  const { tutorid, subject, grade } = req.query;

  try {
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
