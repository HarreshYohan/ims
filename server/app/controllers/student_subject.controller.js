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

  try {
    const StudentSubject = await StudentSubject.findByPk(id, {
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
      ]
    });

    if (StudentSubject) {
      res.send(StudentSubject);
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

exports.getSubjectsForStudentGrade = async (req, res) => {
  const { studentid } = req.params;

  try {
    const student = await Student.findByPk(studentid);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const grade = await Grade.findOne({ where: { name: student.grade } });

    if (!grade) {
      return res.status(404).json({ message: 'Grade not found for the student' });
    }

    const subjectTutors = await SubjectTutor.findAll({
      where: { gradeid: grade.id },
      include: [{ model: Subject, as: 'subject' }]
    });

    // Get already enrolled subjectTutor ids for this student
    const enrolledSubjects = await StudentSubject.findAll({
      where: { studentid },
      attributes: ['subjecttutorid']
    });

    const enrolledIds = enrolledSubjects.map(sub => sub.subjecttutorid);

    // Filter subjectTutors where id is NOT in enrolledIds
    const availableSubjects = subjectTutors
      .filter(st => !enrolledIds.includes(st.id))
      .map(st => ({
        id: st.id,
        subject: st.subject.name,
        tutorid: st.tutorid
      }));

    res.json({ subjects:availableSubjects  });
  } catch (error) {
    console.error('Error fetching subjects for student grade:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.addSubjectToStudent = async (req, res) => {
  const { studentid, subjectid } = req.body;
  try {
    const student = await Student.findByPk(studentid);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const grade = await Grade.findOne({ where: { name: student.grade } });

    if (!grade) {
      return res.status(404).json({ message: 'Grade not found for the student' });
    }

    const subjectTutor = await SubjectTutor.findOne({
      where: { gradeid: grade.id, subjectid: subjectid }
    });

    if (!subjectTutor) {
      return res.status(404).json({ message: 'Subject Tutor not found for this subject and grade' });
    }

    const studentSubject = await StudentSubject.create({
      studentid: studentid,
      subjecttutorid: subjectTutor.id, 
      is_active : true
    });

    res.status(201).json({ message: 'Subject added successfully', data: studentSubject });
  } catch (error) {
    console.error('Error adding subject to student:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.removeSubjectFromStudent = async (req, res) => {
  const { studentid, subjectid } = req.params;
  try {
    const deleted = await StudentSubject.destroy({
      where: { studentid:studentid, subjecttutorid: subjectid }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Subject not found or already removed.' });
    }

    res.json({ message: 'Subject removed successfully.' });
  } catch (error) {
    console.error('Error removing subject:', error);
    res.status(500).json({ message: error.message });
  }
};