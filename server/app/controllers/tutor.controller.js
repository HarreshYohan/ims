const { validationResult, check } = require('express-validator');
const { User, Tutor, SubjectTutor, Subject, Grade, Notes } = require('../models');
const bcrypt = require('bcryptjs');
const logger = require('../lib/logger');

exports.validate = (method) => {
  switch (method) {
    case 'createTutor': {
      return [
        check('firstname', 'First name is required').notEmpty(),
        check('lastname', 'Last name is required').notEmpty(),
        check('title', 'Title is required').notEmpty(),
        check('title', 'Title must be Mr, Mrs, Ms, Miss, Dr, or Rev').isIn(['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Rev']),
        check('email', 'Invalid email address').isEmail(),
        check('contact', 'Contact is required').notEmpty(),
        check('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
      ];
    }
    default:
      return [];
  }
};

exports.create = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, email, firstname, lastname, title, contact } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'A tutor with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      user_type: 'TUTOR',
      is_active: true,
    });

    const newTutor = await Tutor.create({
      user_id: newUser.id,
      title,
      firstname,
      lastname,
      contact,
    });

    const tutorWithUser = await Tutor.findOne({
      where: { user_id: newUser.id },
      include: [{ model: User, as: 'user', attributes: ['username', 'email'] }]
    });

    logger.info(`Tutor created: ${email}`);
    res.status(201).json(tutorWithUser);
  } catch (err) {
    next(err);
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const { search, page, limit } = req.query;
    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(100, parseInt(limit) || 20);
    const offset = (pageNum - 1) * limitNum;

    const { Op } = require('sequelize');
    const where = {};

    if (search) {
      where[Op.or] = [
        { firstname: { [Op.iLike]: `%${search}%` } },
        { lastname: { [Op.iLike]: `%${search}%` } },
        { '$user.email$': { [Op.iLike]: `%${search}%` } },
        { '$user.username$': { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Tutor.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['username', 'email'] }],
      order: [['user_id', 'DESC']],
      limit: limitNum,
      offset,
    });
    res.json({ total: count, page: pageNum, limit: limitNum, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.findOne = async (req, res, next) => {
  const id = req.params.id;
  try {
    const data = await Tutor.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['username', 'email'] }]
    });
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ message: `Tutor with id=${id} not found.` });
    }
  } catch (err) {
    next(err);
  }
};

// Single, complete update handler (previous code had a duplicate that was silently overwriting the first)
exports.update = async (req, res, next) => {
  const id = req.params.id;
  const { username, password, email, firstname, lastname, title, contact } = req.body;

  try {
    const tutor = await Tutor.findByPk(id);
    if (!tutor) {
      return res.status(404).json({ message: `Tutor with id=${id} not found.` });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 12) : undefined;

    // Update User record
    if (username || email || hashedPassword) {
      const userUpdate = {};
      if (username) userUpdate.username = username;
      if (email) userUpdate.email = email;
      if (hashedPassword) userUpdate.password = hashedPassword;
      await User.update(userUpdate, { where: { id: tutor.user_id } });
    }

    // Update Tutor profile
    await tutor.update({
      firstname: firstname || tutor.firstname,
      lastname:  lastname  || tutor.lastname,
      title:     title     || tutor.title,
      contact:   contact   || tutor.contact,
    });

    logger.info(`Tutor updated: id=${id}`);
    res.status(200).json({ message: 'Tutor updated successfully.', tutor });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  const id = req.params.id;
  try {
    const tutor = await Tutor.findByPk(id);
    if (!tutor) {
      return res.status(404).json({ message: `Tutor with id=${id} not found.` });
    }
    await User.destroy({ where: { id: tutor.user_id } });
    logger.info(`Tutor/User deleted: id=${id}`);
    res.json({ message: 'Tutor and associated account deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.approveOrRejectNote = async (req, res, next) => {
  const { id } = req.params;
  const { status, points } = req.body;
  try {
    const note = await Notes.findByPk(id);
    if (!note) return res.status(404).json({ error: 'Note not found.' });

    note.status = status;
    note.points = status === 'Approved' ? points : 0;
    await note.save();

    res.json(note);
  } catch (err) {
    next(err);
  }
};

exports.getSubjectMapping = async (req, res, next) => {
  try {
    const tutor = await Tutor.findOne({ where: { user_id: req.params.id } });
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }
    const mappings = await SubjectTutor.findAll({
      where: { tutorid: tutor.id },
      include: [
        { model: Subject, as: 'subject' },
        { model: Grade, as: 'grade' },
      ],
    });

    const result = mappings.map(m => ({
      id: m.id,
      subject: m.subject.name,
      grade: m.grade.name,
    }));

    res.json({ subjects: result });
  } catch (err) {
    next(err);
  }
};

exports.addSubjectToTutor = async (req, res, next) => {
  const { tutorid, subjectid, gradeid, fees } = req.body;
  try {
    const exists = await SubjectTutor.findOne({ where: { tutorid, subjectid, gradeid } });
    if (exists) {
      return res.status(409).json({ message: 'Mapping already exists.' });
    }
    const mapping = await SubjectTutor.create({ tutorid, subjectid, gradeid, fees });
    res.status(201).json(mapping);
  } catch (err) {
    next(err);
  }
};

exports.removeSubject = async (req, res, next) => {
  try {
    const mapping = await SubjectTutor.findByPk(req.params.mappingid);
    if (!mapping) return res.status(404).json({ message: 'Mapping not found.' });
    await mapping.destroy();
    res.json({ message: 'Subject mapping removed successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.getAllGrades = async (req, res, next) => {
  try {
    const grades = await Grade.findAll();
    res.json(grades);
  } catch (err) {
    next(err);
  }
};

exports.getSubjectsByGrade = async (req, res, next) => {
  try {
    const { gradeid } = req.params;
    const subjectTutors = await SubjectTutor.findAll({
      where: { gradeid },
      include: [{ model: Subject, as: 'subject' }],
    });

    const uniqueSubjects = Array.from(
      new Map(subjectTutors.map(st => [st.subject.id, { id: st.subject.id, name: st.subject.name }])).values()
    );

    res.json(uniqueSubjects);
  } catch (err) {
    next(err);
  }
};
