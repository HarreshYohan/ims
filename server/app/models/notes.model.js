const { DataTypes, Sequelize } = require('sequelize');

const Notes = (sequelize) => {
  return  sequelize.define('Notes', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    studentid: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Student', 
        key: 'id',
      },
      allowNull: false,
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
    chapter: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
    heading: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
    note: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
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
    tableName: 'notes', 
    timestamps: false,
  });
};



module.exports = Notes;

