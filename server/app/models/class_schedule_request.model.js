const { DataTypes } = require('sequelize');

const ClassScheduleRequest = (sequelize) => {
  return sequelize.define('ClassScheduleRequest', {
    subject_tutor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'subject_tutor', key: 'id' }
    },
    timeslotid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    classroomid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'classroom', key: 'id' }
    },
    day_of_week: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(30),
      defaultValue: 'PENDING_TUTOR'
    },
    tutor_preferred_day: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    tutor_preferred_timeslotid: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at'
    }
  }, {
    tableName: 'class_schedule_requests',
    timestamps: true
  });
};

module.exports = ClassScheduleRequest;
