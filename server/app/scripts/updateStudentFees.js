const { Sequelize } = require('sequelize');
const dbConfig = require("../config/db.config.js");
const { User, Student, StudentSubject, SubjectTutor, Subject, StudentFees } = require('../models');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: true,
    logging: false,
  });

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; 
    const currentYear = currentDate.getFullYear();

    // Fetch all students
    const students = await Student.findAll();

    for (const student of students) {
      const feesRecord = await StudentFees.findOne({
        where: {
          studentid: student.id,
          month: currentMonth.toString(),
          year: currentYear,
        },
      });

      if (!feesRecord) {
        // Calculate total fees for the student
        const studentSubjects = await StudentSubject.findAll({
          where: { studentid: student.id },
          include: [{ model: SubjectTutor, as: 'subjectTutor' ,required: true }],
        });

        const totalAmount = studentSubjects.reduce((sum, studentSubject) => {
          return sum + studentSubject.subjectTutor.fees;
        }, 0);

        // Create a new fees record
        await StudentFees.create({
          studentid: student.id,
          month: currentMonth.toString(),
          year: currentYear,
          totalAmount: totalAmount,
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    console.log('Student fees records updated successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
})();
