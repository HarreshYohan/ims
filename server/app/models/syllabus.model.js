const { DataTypes } = require('sequelize');

const Syllabus = (sequelize) => {
  return sequelize.define('Syllabus', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
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
    tableName: 'syllabus', 
    timestamps: true,
    underscored: true
  });
};

module.exports = Syllabus;
