const dbConfig = require("../config/db.config.js");
const { Sequelize } = require('sequelize');


const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: dbConfig.dialect,
  logging: false,
});

// NOTE: sequelize.sync() has been intentionally removed.
// Use 'npm run migrate' (sequelize-cli db:migrate) to manage schema changes safely.
// See: server/app/migrations/

const User = require('./user.model')(sequelize, Sequelize.DataTypes);
const Student = require('./student.model')(sequelize, Sequelize.DataTypes);
const Tutor = require('./tutor.model')(sequelize, Sequelize.DataTypes);
const Staff = require('./staff.model')(sequelize, Sequelize.DataTypes);
const Admin = require('./admin.model')(sequelize, Sequelize.DataTypes);
const Grade = require('./grade.model')(sequelize, Sequelize.DataTypes);
const Subject = require('./subject.model')(sequelize, Sequelize.DataTypes);
const Classroom = require('./classroom.model')(sequelize, Sequelize.DataTypes);
const SubjectTutor = require('./subject_tutor.model')(sequelize, Sequelize.DataTypes);
const StudentSubject = require('./student_subject.model')(sequelize, Sequelize.DataTypes);
const Timetable = require('./timetable.model')(sequelize, Sequelize.DataTypes);
const Chatroom = require('./chatroom.model')(sequelize, Sequelize.DataTypes);
const Transaction = require('./transaction.model')(sequelize, Sequelize.DataTypes);
const StudentFees = require('./student_fees.model')(sequelize, Sequelize.DataTypes);
const Notes = require('./notes.model')(sequelize, Sequelize.DataTypes);
const Goals = require('./goals.model')(sequelize, Sequelize.DataTypes);
const TutorPayment = require('./tutor_payment.model')(sequelize, Sequelize.DataTypes);
const Flashcard = require('./flashcard.model')(sequelize, Sequelize.DataTypes);
const QuizAttempt = require('./quiz_attempt.model')(sequelize, Sequelize.DataTypes);
const ActivityLog = require('./activity_log.model')(sequelize, Sequelize.DataTypes);
// Associations
User.hasOne(Student, { foreignKey: 'user_id', as: 'student' });
User.hasOne(Tutor, { foreignKey: 'user_id', as: 'tutor' });
User.hasOne(Staff, { foreignKey: 'user_id', as: 'staff' });
User.hasOne(Admin, { foreignKey: 'user_id', as: 'admin' });

Student.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Tutor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Staff.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Admin.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

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

StudentFees.belongsTo(Student, { foreignKey: 'studentid', as: 'student' });

Notes.belongsTo(Student, { foreignKey: 'studentid', as: 'student' });

Goals.belongsTo(Student, { foreignKey: 'studentid', as: 'student' });

TutorPayment.belongsTo(Tutor, {foreignKey: 'tutorid',as: 'tutor'})

Flashcard.belongsTo(Student, { foreignKey: 'studentid', as: 'student' });
Flashcard.belongsTo(Notes, { foreignKey: 'noteid', as: 'note' });

QuizAttempt.belongsTo(Student, { foreignKey: 'studentid', as: 'student' });

module.exports = {
  sequelize,
  User,
  Student,
  Tutor,
  Staff,
  Admin,
  Grade,
  Subject,
  Classroom,
  SubjectTutor,
  StudentSubject,
  Timetable,
  Chatroom,
  Transaction,
  StudentFees,
  Notes,
  Goals,
  TutorPayment,
  Flashcard,
  QuizAttempt,
  ActivityLog
};