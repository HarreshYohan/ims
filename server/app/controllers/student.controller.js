const { User, Student, StudentSubject, SubjectTutor, Subject, Tutor, Syllabus } = require('../models');
const bcrypt = require('bcryptjs');
const { Parser } = require('json2csv');
const fs = require('fs');
const os = require('os');
const path = require('path');
const logger = require('../lib/logger');
const { check, validationResult } = require('express-validator');

// Allowlist of columns that can be used as filters in downloadAll
const ALLOWED_FILTER_COLUMNS = ['grade', 'contact'];

exports.validate = (method) => {
  switch (method) {
    case 'createUser': {
      return [
        check('firstname', 'First name is required').notEmpty(),
        check('lastname', 'Last name is required').notEmpty(),
        check('grade', 'Grade is required').notEmpty(),
        check('contact', 'Contact is required').notEmpty(),
        check('email', 'Invalid email address').isEmail(),
        check('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
      ];
    }
    default:
      return [];
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const { search, grade, page, limit, tutorid } = req.query;
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

    if (grade) {
      where.grade = grade;
    }

    if (tutorid) {
      const tutor = await Tutor.findOne({ where: { user_id: tutorid } });
      if (tutor) {
        const studentSubjects = await StudentSubject.findAll({
          include: [{ model: SubjectTutor, as: 'subjectTutor', where: { tutorid: tutor.id } }],
          attributes: ['studentid']
        });
        const studentIds = [...new Set(studentSubjects.map(ss => ss.studentid))];
        where.id = { [Op.in]: studentIds };
      } else {
        where.id = null; // No tutor found, return nothing
      }
    }

    const { count, rows } = await Student.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['username', 'email'] },
        { model: Syllabus, as: 'syllabus', attributes: ['id', 'name'] }
      ],
      order: [['user_id', 'DESC']],
      limit: limitNum,
      offset,
      subQuery: false, // Prevents issues with limit+association filtering
    });
    res.json({ total: count, page: pageNum, limit: limitNum, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, firstname, lastname, grade, contact, syllabusid } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    // Use provided password/username or generate them
    const username = req.body.username || `ST${Math.floor(1000 + Math.random() * 9000)}`;
    const rawPassword = req.body.password || Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      user_type: 'STUDENT',
      is_active: true,
    });

    const newStudent = await Student.create({
      user_id: newUser.id,
      firstname,
      lastname,
      grade,
      contact,
      syllabusid,
    });
    
    // Refresh to include joined user data
    const studentWithUser = await Student.findOne({
      where: { user_id: newUser.id },
      include: [
        { model: User, as: 'user', attributes: ['username', 'email'] },
        { model: Syllabus, as: 'syllabus', attributes: ['id', 'name'] }
      ]
    });

    // Send Greeting Email (non-blocking)
    const { sendStudentGreeting } = require('../services/email.service');
    sendStudentGreeting(email, firstname, username, rawPassword).catch(err => {
        logger.error(`Background email task failed for ${email}: ${err.message}`);
    });

    logger.info(`Student created with auto-creds: ${email}`);
    res.status(201).json({
        ...studentWithUser.toJSON(),
        generatedUsername: username,
        generatedPassword: rawPassword // Send back so UI can display it once
    });
  } catch (err) {
    next(err);
  }
};

exports.findOne = async (req, res, next) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid student ID format.' });
  }

  try {
    const data = await Student.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['username', 'email'] },
        { model: Syllabus, as: 'syllabus', attributes: ['id', 'name'] }
      ]
    });
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ message: `Student with id=${id} not found.` });
    }
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  const id = req.params.id;
  try {
    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({ message: `Student with id=${id} not found.` });
    }
    await User.destroy({ where: { id: student.user_id } }); // Cascades to Student
    logger.info(`Student/User deleted: id=${id}`);
    res.json({ message: 'Student and associated account deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  const id = req.params.id;
  const { username, password, email, firstname, lastname, grade, contact, syllabusid } = req.body;

  try {
    const student = await Student.findByPk(id, { include: ['user'] });
    if (!student) {
      return res.status(404).json({ message: `Student with id=${id} not found.` });
    }

    // Update User account if fields provided
    if (username || email || password) {
      const userUpdate = {};
      if (username) userUpdate.username = username;
      if (email)    userUpdate.email    = email;
      if (password) userUpdate.password = await bcrypt.hash(password, 12);
      
      await User.update(userUpdate, { where: { id: student.user_id } });
    }

    // Update Student profile
    await student.update({
      firstname: firstname || student.firstname,
      lastname:  lastname  || student.lastname,
      grade:     grade     || student.grade,
      contact:   contact   || student.contact,
      syllabusid: syllabusid || student.syllabusid,
    });

    logger.info(`Student updated: id=${id}`);
    res.status(200).json({ message: 'Student updated successfully.', student });
  } catch (err) {
    next(err);
  }
};

exports.student_subject = async (req, res, next) => {
  const { id } = req.params;
  const numericId = parseInt(id);

  try {
    const { Op } = require('sequelize');
    const studentWhere = {};
    
    if (!isNaN(numericId)) {
      studentWhere[Op.or] = [ { user_id: numericId }, { id: numericId } ];
    } else {
      // If not numeric, only try user_id (if it might be a UUID, but here it's likely int)
      // Actually, if it's not numeric and we expect numeric, just 404
      return res.status(404).json({ message: `Student for id=${id} not found.` });
    }

    const student = await Student.findOne({ where: studentWhere });
    if (!student) {
      return res.status(404).json({ message: `Student for id=${id} not found.` });
    }

    const studentSubjects = await StudentSubject.findAll({
      where: { studentid: student.id },
      attributes: ['studentid'],
      include: [{
        model: SubjectTutor,
        as: 'subjectTutor',
        include: [
          { model: Subject, as: 'subject', attributes: ['name'] },
          { model: Tutor, as: 'tutor' }
        ],
        attributes: ['id'],
      }],
    });

    const subjects = studentSubjects.map(item => {
      let subjectName = item.subjectTutor?.subject?.name || 'Unknown Subject';
      let t = item.subjectTutor?.tutor;
      let tutorName = t ? `${t.title} ${t.firstname} ${t.lastname}` : 'Unknown Tutor';
      
      return {
        subject: `${subjectName} - ${tutorName}`,
        subjectName: subjectName,
        tutorName: tutorName,
        subject_id: item.subjectTutor.id,
      };
    });

    console.log(`Student ID: ${id}, Subjects Found: ${subjects.length}`);
    res.status(200).json({ data: { student_id: id, subjects } });
  } catch (err) {
    console.error('Error in student_subject:', err);
    next(err);
  }
};

exports.downloadAll = async (req, res, next) => {
  try {
    const { columns, ...filters } = req.query;
    const selectedColumns = columns
      ? columns.split(',')
      : ['id', 'username', 'email', 'firstname', 'lastname', 'grade', 'contact', 'createdAt', 'updatedAt'];

    // Only allow explicitly whitelisted filter columns — prevents injection
    const filterConditions = {};
    ALLOWED_FILTER_COLUMNS.forEach(key => {
      if (filters[key]) filterConditions[key] = filters[key];
    });

    const students = await Student.findAll({
      where: filterConditions,
      order: [['createdAt', 'DESC']],
    });

    const json2csvParser = new Parser({ fields: selectedColumns });
    const csv = json2csvParser.parse(students.map(s => s.toJSON()));

    // Write to OS temp dir — not inside the source tree
    const filePath = path.join(os.tmpdir(), `students_${Date.now()}.csv`);
    fs.writeFileSync(filePath, csv);

    res.download(filePath, 'students.csv', (err) => {
      if (err) next(err);
      fs.unlink(filePath, () => {}); // clean up silently
    });
  } catch (error) {
    next(error);
  }
};
