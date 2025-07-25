
const { User, Tutor, SubjectTutor, Subject, Grade } = require('../models');
const bcrypt = require('bcryptjs');
const { log } = require("console");
const { check, validationResult } = require('express-validator');

exports.create = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, email, firstname, lastname, title , contact } = req.body;

  try {
      const existingTutor = await Tutor.findOne({ where: { firstname, lastname , email} });
      const existingUser = await Tutor.findOne({ where: { email} });

      if (existingTutor || existingUser) {
        throw new Error('Email or Tutor already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newTutorData = async () => {

        const newUser = await User.create({
          username: username,
          email: email,
          password: hashedPassword,
          user_type: 'TUTOR',
          is_active: true
        });
        

        const newTutor = await Tutor.create({
          firstname: firstname,
          username: username,
          user_id: newUser.id,
          email: email,
          password: hashedPassword,
          lastname: lastname,
          title: title,
          contact: contact,
        });

        return newTutor

      }

      const result = await newTutorData();
      res.status(201).send(result);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while creating the User.'
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const {  rows } = await Tutor.findAndCountAll({
        order: [['id', 'DESC']]
    });

    res.json({
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.findOne = (req, res) => {
    const id = req.params.id;
  
    Tutor.findByPk(id)
      .then(data => {
        if (data) {
          res.send(data);
        } else {
          res.status(404).send({
            message: `Cannot find tutor with id=${id}.`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving tutor with id=" + id
        });
      });
  };


exports.update = (req, res) => {
  const id = req.params.id;

  Tutor.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "tutor was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update tutor with id=${id}. Maybe tutor was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating tutor with id=" + id + "Error" + err
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
    const tutor = await Tutor.findByPk(id);
    
    if (!tutor) {
      return res.status(404).send({ message: `Cannot find Student with id=${id}.` });
    }

    await tutor.destroy({ where: { id } });

    res.send({ message: "User was deleted successfully!", tutor });

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

  const { username, password, email, firstname, lastname, title, contact } = req.body;

  try {
    const tutor = await Tutor.findByPk(id);
    
    if (!tutor) {
      return res.status(404).send({ message: `Cannot find Tutor with id=${id}.` });
    }

    const existingTutor = await Tutor.findOne({ where: { firstname, lastname, email } });

    if (existingTutor && existingTutor.id !== tutor.id) {
      throw new Error('Email or Tutor name already exists');
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : tutor.password;

    await tutor.update({
      username: username || tutor.username,
      email: email || tutor.email,
      password: hashedPassword,
      firstname: firstname || tutor.firstname,
      lastname: lastname || tutor.lastname,
      title: title || tutor.title,
      contact: contact || tutor.contact,
    });

    res.status(200).send({ message: "Tutor was updated successfully!", tutor });
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while updating the Tutor.'
    });
  }
};

exports.approveOrRejectNote = async (req, res) => {
  const { id } = req.params;
  const { status, points } = req.body;
  try {
    const note = await Notes.findByPk(id);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    note.status = status;
    note.points = status === 'Approved' ? points : 0;
    await note.save();

    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getSubjectMapping = async (req, res) => {
  try {
    const mappings = await SubjectTutor.findAll({
      where: { tutorid: req.params.id },
      include: [{ model: Subject, as: 'subject' }, { model: Grade, as: 'grade' }]
    });

    const result = mappings.map(m => ({
      id: m.id,
      subject: m.subject.name,
      grade: m.grade.name
    }));

    res.json({ subjects: result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.addSubject = async (req, res) => {
  try {
    const { tutorid, subjectgradeid } = req.body;
    const [subjectId, gradeId] = subjectgradeid.split('-');
    const mapping = await SubjectTutor.create({ tutorid, subjectid: subjectId, gradeid: gradeId });
    res.status(201).send(mapping);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.removeSubject = async (req, res) => {
  try {
    const mapping = await SubjectTutor.findByPk(req.params.mappingid);
    if (!mapping) return res.status(404).send({ message: 'Mapping not found' });

    await mapping.destroy();
    res.send({ message: 'Subject mapping removed successfully' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getAllGrades = async (req, res) => {
  try {
    const grades = await Grade.findAll();
    res.json(grades);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getSubjectsByGrade = async (req, res) => {
  try {
    const gradeid = req.params.gradeid;

    const subjectTutors = await SubjectTutor.findAll({
      where: { gradeid },
      include: [{ model: Subject, as: 'subject' }]
    });

    // Map unique subjects
    const subjects = subjectTutors.map(st => ({
      id: st.subject.id,
      name: st.subject.name
    }));

    // Remove duplicates (optional)
    const uniqueSubjects = Array.from(
      new Map(subjects.map(s => [s.id, s])).values()
    );

    res.json(uniqueSubjects);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.addSubjectToTutor = async (req, res) => {
  const { tutorid, subjectid, gradeid, fees } = req.body;

  try {
    const exists = await SubjectTutor.findOne({
      where: { tutorid, subjectid, gradeid }
    });

    if (exists) {
      return res.status(400).json({ message: 'Mapping already exists' });
    }

    const mapping = await SubjectTutor.create({ tutorid, subjectid, gradeid, fees });
    res.status(201).json(mapping);

  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
