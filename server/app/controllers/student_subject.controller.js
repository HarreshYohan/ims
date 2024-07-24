const { StudentSubject,  Student, SubjectTutor , Subject, Tutor, Grade} = require('../models');

exports.create = async (req, res) => {
  const { studentid, subjecttutorid } = req.body;

  try {
    const newStudentSubject = await StudentSubject.create({
        studentid,subjecttutorid
    });

    res.status(201).send(newStudentSubject);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while creating the StudentSubject.'
    });
  }
};

exports.findAll = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows }  = await StudentSubject.findAndCountAll({
      include: [
        { model: Student,  as: 'student' },
        {
            model: SubjectTutor,
            as: 'subjectTutor',
            include: [
                { model: Subject, as: 'subject' },
                { model: Tutor, as: 'tutor' },
                { model: Grade, as: 'grade' },
            ],
        },
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

exports.findOne = async (req, res) => {
  const id = req.params.id;
console.log(id);
  try {
    const studentSubject = await StudentSubject.findAll( {
      where: { studentid: id }, 
      include: [
        { model: Student,  as: 'student' , attributes: ['id'] },
        {
            model: SubjectTutor,
            as: 'subjectTutor',
            include: [
                { model: Subject, as: 'subject' , attributes: ['id', 'name']},
                { model: Tutor, as: 'tutor', attributes: ['id', 'title', 'firstname', 'lastname'] },
                { model: Grade, as: 'grade', attributes: ['id', 'name'] },
            ],
            attributes: ['id', 'fees']
        },
      ]
    });

    if (studentSubject) {
      res.send(studentSubject);
    } else {
      res.status(404).send({
        message: `Cannot find StudentSubject with id=${id}.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving StudentSubject with id=${id}: ${err.message}`
    });
  }
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const { studentid, subjecttutorid } = req.body;

  try {
    const StudentSubject = await StudentSubject.findByPk(id);

    if (!StudentSubject) {
      return res.status(404).send({ message: `Cannot find StudentSubject with id=${id}.` });
    }

    await StudentSubject.update({
      studentid: studentid || StudentSubject.studentid,
      subjecttutorid: subjecttutorid || StudentSubject.subjecttutorid,
    });

    res.status(200).send({ message: "StudentSubject was updated successfully!", StudentSubject });
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while updating the StudentSubject.'
    });
  }
};

exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const StudentSubject = await StudentSubject.findByPk(id);

    if (!StudentSubject) {
      return res.status(404).send({ message: `Cannot find StudentSubject with id=${id}.` });
    }

    await StudentSubject.destroy();

    res.send({ message: "StudentSubject was deleted successfully!", StudentSubject });
  } catch (err) {
    res.status(500).send({
      message: `Could not delete StudentSubject with id=${id}: ${err.message}`
    });
  }
};
