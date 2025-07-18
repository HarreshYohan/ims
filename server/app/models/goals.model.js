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
          primaryKey: true,
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
      allowNull: false,
    },
    goaltitle: {
      type: DataTypes.STRING,
      allowNull: false,
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
    tableName: 'goals',
    timestamps: false,
  });
};

module.exports = Goals;