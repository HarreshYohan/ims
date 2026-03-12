const { DataTypes } = require('sequelize');

const QuizAttempt = (sequelize) => {
  return sequelize.define('QuizAttempt', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    studentid: {
      type: DataTypes.INTEGER,
      references: { model: 'student', key: 'id' },
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    total_questions: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    correct_answers: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    score_percent: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    time_taken_seconds: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  }, {
    tableName: 'quiz_attempt',
    timestamps: false,
  });
};

module.exports = QuizAttempt;
