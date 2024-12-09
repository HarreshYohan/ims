const { Student, Tutor, Staff, Timetable, SubjectTutor, sequelize, Subject, Grade, Classroom } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardData = async (req, res) => {
  try {
    // Total students
    const totalStudents = await Student.count();

    // Number of students by grade
    const studentsByGrade = await sequelize.query(
      'SELECT grade, COUNT(id) as count FROM student GROUP BY grade',
      { type: sequelize.QueryTypes.SELECT }
    );

    // Total teachers
    const totalTeachers = await Tutor.count();

    // Total staff
    const totalStaff = await Staff.count();

    // Get current day index (0: Sunday, 1: Monday, ..., 6: Saturday)
    const now = new Date();
    const dayOfWeek = now.getDay();

    // Map day index to column name
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayColumn = days[dayOfWeek];
    const asso = currentDayColumn + 'cls';

    // Next 3 classes for the day
    const nextClasses = await Timetable.findAll({
      attributes: ['timeslot', 'classroomid', currentDayColumn],
      where: {
        [currentDayColumn]: {
          [Op.ne]: null
        },
      },
      include: [
        {
          model: SubjectTutor,
          as: asso,
          include: [
            { model: Subject, as: 'subject' },
            { model: Tutor, as: 'tutor' },
            { model: Grade, as: 'grade' },
          ],
        },
        {
          model: Classroom,
          as: 'classroom',
          attributes: ['id', 'name']
        }
      ],
      order: [['timeslotid', 'ASC']]
    });

    // Fetch subject and tutor details
    const subjectIds = nextClasses.flatMap(cls => cls[asso]?.subjectid || []);
    const tutorIds = nextClasses.flatMap(cls => cls[asso]?.tutorid || []);
    const classroomIds = nextClasses.flatMap(cls => cls[asso]?.classroomid || []);

    const subjects = await Subject.findAll({
      where: { id: subjectIds },
      attributes: ['id', 'name']
    });

    const classrooms = await Classroom.findAll({
      where: { id: classroomIds },
      attributes: ['id', 'name']
    });

    const tutors = await Tutor.findAll({
      where: { id: tutorIds },
      attributes: ['id', 'firstname', 'lastname']
    });

    const nextClassesWithDetails = nextClasses.map(cls => {
      const classDetails = cls[asso] || {};
      const subject = subjects.find(sub => sub.id === classDetails.subjectid);
      const tutor = tutors.find(tut => tut.id === classDetails.tutorid);

      return {
        ...cls.toJSON(),
        subject: subject ? subject.name : null,
        tutor: tutor ? `${tutor.firstname} ${tutor.lastname}` : null,
        grade: cls[asso].grade ? cls[asso].grade.name : null,
        classroom: cls.classroom ? cls.classroom.name : null
      };
    });

    const groupedByGrade = nextClassesWithDetails.reduce((acc, cls) => {
      const gradeName = cls.grade;
      if (!acc[gradeName]) {
        acc[gradeName] = [];
      }
      acc[gradeName].push(cls);
      return acc;
    }, {});

    res.json({
      totalStudents,
      studentsByGrade,
      totalTeachers,
      totalStaff,
      nextClasses: groupedByGrade
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};
