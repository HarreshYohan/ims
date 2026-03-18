const { DataTypes, Sequelize } = require('sequelize');

  const Goals = (sequelize) => {
    return sequelize.define('Goal', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    studentid: {
          type: DataTypes.INTEGER,
          references: {
            model: 'Student', 
            key: 'id',
          },
          allowNull: false,
        },
    subjecttutorid: {
      type: DataTypes.INTEGER,
      references: {
        model: 'SubjectTutor', 
        key: 'id',
      },
      allowNull: true,
    },
    goaltitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    checklist: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue:"Active"
    },
    targetdate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    progress: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    streak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastprogressupdate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    }
  }, {
    tableName: 'goals',
    timestamps: true,
    underscored: true
  });
};

module.exports = Goals;