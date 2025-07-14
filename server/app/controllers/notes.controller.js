const { Notes } = require('../models');
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

  const { note, subject, heading, chapter, studentid } = req.body;

  try {
    const newNote = await Notes.create({ note, subject, heading, chapter, studentid });
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

  console.log(studentid, subject)
  try {
    const notes = await Notes.findAll({
      where: {
        studentid : studentid,
        subject: subject
      }
    });

    // if (!notes.length) {
    //   return res.status(404).json({ message: 'No notes found for this student and subject.' });
    // }

    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
