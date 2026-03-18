const { Sequelize, Op } = require('sequelize');
const dbConfig = require("../config/db.config.js");
const { Grade, Timetable, StudentFees } = require('../models');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: true,
    logging: false,
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // 1. Remove unwanted timeslot '18:30 - 20:30'
    console.log('Removing timeslot "18:30 - 20:30" and related timetable entries...');
    await Timetable.destroy({
      where: {
        timeslot: '18:30 - 20:30'
      }
    });
    console.log('Unwanted timeslot removed.');

    // 2. Pre-seed standard Grades
    const standardGrades = [
      'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
      'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
      'Grade 11', 'Grade 12', 'Grade 13',
      'After O/L', 'After A/L', 'Pre School'
    ];

    console.log('Seeding standard grades...');
    for (const name of standardGrades) {
      await Grade.findOrCreate({
        where: { name },
        defaults: { name }
      });
    }
    console.log('Grades seeded.');

    // 3. Cleanup numeric months in student_fees
    console.log('Standardizing month names in student_fees...');
    const monthMap = {
      '1': 'January', '2': 'February', '3': 'March', '4': 'April',
      '5': 'May', '6': 'June', '7': 'July', '8': 'August',
      '9': 'September', '10': 'October', '11': 'November', '12': 'December'
    };

    for (const [num, name] of Object.entries(monthMap)) {
      await StudentFees.update(
        { month: name },
        { where: { month: num } }
      );
    }
    console.log('Month names standardized.');

    console.log('Cleanup complete.');
  } catch (error) {
    console.error('Cleanup failed:', error);
  } finally {
    await sequelize.close();
  }
})();
