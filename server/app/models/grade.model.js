const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
    const Grade = sequelize.define("grade", {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
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
      tableName: 'grade',
      timestamps: false,
    });
  
    return Grade;
  };
  