const dbConfig = require("../config/db.config.js");
const { Sequelize } = require('sequelize');


const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: true,
  logging: false,
});

sequelize.sync()
  .then(() => {
    console.log('Database synchronized.');
  })
  .catch(err => {
    console.error('Failed to sync database:', err.message);
  });

const User = require('./user.model')(sequelize, Sequelize.DataTypes);
const Student = require('./student.model')(sequelize, Sequelize.DataTypes);
const Tutor = require('./tutor.model')(sequelize, Sequelize.DataTypes);
const Staff = require('./staff.model')(sequelize, Sequelize.DataTypes);
const Grade = require('./grade.model')(sequelize, Sequelize.DataTypes);
const Subject = require('./subject.model')(sequelize, Sequelize.DataTypes);
const Classroom = require('./classroom.model')(sequelize, Sequelize.DataTypes);
const SubjectTutor = require('./subject_tutor.model')(sequelize, Sequelize.DataTypes);
const StudentSubject = require('./student_subject.model')(sequelize, Sequelize.DataTypes);
const Timetable = require('./timetable.model')(sequelize, Sequelize.DataTypes);
const Chatroom = require('./chatroom.model')(sequelize, Sequelize.DataTypes);
const Transaction = require('./transaction.model')(sequelize, Sequelize.DataTypes);

SubjectTutor.belongsTo(Tutor, { foreignKey: 'tutorid', as: 'tutor' });
SubjectTutor.belongsTo(Subject, { foreignKey: 'subjectid', as: 'subject' });
SubjectTutor.belongsTo(Grade, { foreignKey: 'gradeid', as: 'grade' });

StudentSubject.belongsTo(SubjectTutor, { foreignKey: 'subjecttutorid', as: 'subjectTutor' });
StudentSubject.belongsTo(Student, { foreignKey: 'studentid', as: 'student' });

Timetable.belongsTo(Classroom, { foreignKey: 'classroomid', as: 'classroom' });
Timetable.belongsTo(SubjectTutor, { foreignKey: 'monday', as: 'mondaycls' });
Timetable.belongsTo(SubjectTutor, { foreignKey: 'tuesday', as: 'tuesdaycls' });
Timetable.belongsTo(SubjectTutor, { foreignKey: 'wednesday', as: 'wednesdaycls' });
Timetable.belongsTo(SubjectTutor, { foreignKey: 'thursday', as: 'thursdaycls' });
Timetable.belongsTo(SubjectTutor, { foreignKey: 'friday', as: 'fridaycls' });
Timetable.belongsTo(SubjectTutor, { foreignKey: 'saturday', as: 'saturdaycls' });
Timetable.belongsTo(SubjectTutor, { foreignKey: 'sunday', as: 'sundaycls' });

Chatroom.belongsTo(SubjectTutor, { foreignKey: 'subjecttutorid', as: 'subjectTutor' });
Chatroom.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Student,
  Tutor,
  Staff,
  Grade,
  Subject,
  Classroom,
  SubjectTutor,
  StudentSubject,
  Timetable,
  Chatroom,
  Transaction

};