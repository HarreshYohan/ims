const { User, Student, StudentSubject, SubjectTutor, Subject } = require('../models');
const bcrypt = require('bcryptjs');
const { log } = require("console");
const { check, validationResult } = require('express-validator');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

exports.validate = (method) => {
  switch (method) {
    case 'createUser': {
      return [
        check('firstname', 'firstname is required').notEmpty(),
        check('lastname', 'lastname is required').notEmpty(),
        check('grade', 'grade is required').notEmpty(),
        check('contact', 'contact is required').notEmpty(),
        check('email', 'Invalid email').isEmail(),
        check('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
      ];
    }
  }
};

exports.findAll = async (req, res) => {
  try {
    const { count, rows } = await Student.findAndCountAll({
      order: [['id', 'DESC']]
    });
    res.json({
      data: rows
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, email, firstname, lastname, grade, contact } = req.body;

  try {
    const existingStudent = await Student.findOne({ where: { firstname, lastname } });

    if (existingStudent) {
      throw new Error('Student already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username: username,
      email: email,
      password: hashedPassword,
      user_type: 'STUDENT',
      is_active: true
    });

    const newStudent = await Student.create({
      username,
      user_id: newUser.id,
      email,
      password: hashedPassword,
      firstname,
      lastname,
      grade,
      contact,
    });

    res.status(201).send(newStudent);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while creating the User.'
    });
  }
};

exports.findOne = (req, res) => {
  const id = req.params.id;

  Student.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find student with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving student with id=" + id
      });
    });
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(404).send({ message: `Cannot find Student with id=${id}.` });
    }

    await Student.destroy({ where: { id } });

    res.send({ message: "User was deleted successfully!", student });

  } catch (err) {
    res.status(500).send({ message: `Could not delete User with id=${id}: ${err.message}` });
  }
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, email, firstname, lastname, grade, contact } = req.body;

  try {
    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(404).send({ message: `Cannot find Student with id=${id}.` });
    }

    const existingStudent = await Student.findOne({ where: { firstname, lastname } });

    if (existingStudent && existingStudent.id !== student.id) {
      throw new Error('Student name already exists');
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : student.password;

    await student.update({
      username,
      email,
      password: hashedPassword,
      firstname: firstname || student.firstname,
      lastname: lastname || student.lastname,
      grade: grade || student.grade,
      contact: contact || student.contact,
    });

    res.status(200).send({ message: "Student was updated successfully!", student });
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while updating the Student.'
    });
  }
};

exports.student_subject = async (req, res) => {
  const id = req.params.id;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const studentSubjects = await StudentSubject.findAll({
      where: { studentid: id },
      attributes: ['studentid'],
      include: [
        {
          model: SubjectTutor,
          as: 'subjectTutor',
          include: [
            {
              model: Subject,
              as: 'subject',
              attributes: ['name']
            }
          ],
          attributes: ['id']
        }
      ]
    });

    const subjects = studentSubjects.map(item => ({
      subject: item.subjectTutor.subject.name,
      subject_id: item.subjectTutor.id
    }));

    const data = { student_id: id, subjects: subjects };

    if (!data) {
      return res.status(404).send({ message: `Cannot find Student with id=${id}.` });
    }

    res.status(200).send({ data });
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while getting the Student subject.'
    });
  }
};

exports.downloadAll = async (req, res) => {
  try {
    const { columns, ...filters } = req.query; 

    const selectedColumns = columns ? columns.split(',') : ['id', 'username', 'email', 'firstname', 'lastname', 'grade', 'contact', 'createdAt', 'updatedAt'];

    const filterConditions = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        filterConditions[key] = filters[key];
      }
    });

    const students = await Student.findAll({
      where: filterConditions,
      order: [['createdAt', 'DESC']]
    });

    const json2csvParser = new Parser({ fields: selectedColumns });
    const csv = json2csvParser.parse(students.map(student => student.toJSON()));

    // Write CSV to file
    const filePath = path.join(__dirname, 'students.csv');
    fs.writeFileSync(filePath, csv);


    res.download(filePath, 'students.csv', (err) => {
      if (err) {
        res.status(500).json({ message: 'Error downloading file', error: err.message });
      }
      fs.unlinkSync(filePath); // delete the file after download
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating CSV', error: error.message });
  }
};
