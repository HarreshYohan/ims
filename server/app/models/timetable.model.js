const { DataTypes, Sequelize } = require('sequelize');

const Timetable = (sequelize) => {
  return  sequelize.define('Timetable', {

    timeslot: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timeslotid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    classroomid: {
      type: DataTypes.INTEGER,
      references: {
          model: 'Classroom', 
          key: 'id',
      },
      allowNull: false,
    },
    monday: {
        type: DataTypes.INTEGER,
        references: {
          model: 'SubjectTutor', 
          key: 'id',
      },
        defaultValue: null,
        allowNull: true,
      },
    tuesday: {
      type: DataTypes.INTEGER,
      references: {
        model: 'SubjectTutor', 
        key: 'id',
    },
      defaultValue: null,
      allowNull: true,
    },
    wednesday: {
      type: DataTypes.INTEGER,
      references: {
        model: 'SubjectTutor', 
        key: 'id',
    },
      defaultValue: null,
      allowNull: true,
    },
    thursday: {
      type: DataTypes.INTEGER,
      references: {
        model: 'SubjectTutor', 
        key: 'id',
    },
      defaultValue: null,
      allowNull: true,
    },
    friday: {
      type: DataTypes.INTEGER,
      references: {
        model: 'SubjectTutor', 
        key: 'id',
    },
      defaultValue: null,
      allowNull: true,
    },
    saturday: {
      type: DataTypes.INTEGER,
      references: {
        model: 'SubjectTutor', 
        key: 'id',
    },
    defaultValue: null,
    allowNull: true,
    },
    sunday: {
      type: DataTypes.INTEGER,
      references: {
        model: 'SubjectTutor', 
        key: 'id',
    },
      defaultValue: null,
      allowNull: true,
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
    tableName: 'timetable', 
    timestamps: false,
  });
};



module.exports = Timetable;

