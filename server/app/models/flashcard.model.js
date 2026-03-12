const { DataTypes } = require('sequelize');

const Flashcard = (sequelize) => {
  return sequelize.define('Flashcard', {
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
    noteid: {
      type: DataTypes.INTEGER,
      references: { model: 'notes', key: 'id' },
      allowNull: true,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    front: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    back: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.STRING(10),
      defaultValue: 'MEDIUM',
    },
    next_review: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
    ease_factor: {
      type: DataTypes.FLOAT,
      defaultValue: 2.5,
    },
    interval: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    repetitions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
    tableName: 'flashcard',
    timestamps: false,
  });
};

module.exports = Flashcard;
