const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
    const Classroom = sequelize.define("classroom", {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      tableName: 'classroom',
      timestamps: false,
    });
  
    return Classroom;
  };
  