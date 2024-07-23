const { DataTypes } = require('sequelize');

const StudentFees = (sequelize) => {
  return sequelize.define('StudentFees', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    studentid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'student',
        key: 'id',
      },
    },
    month: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PAID', 'WAIVED_OFF', 'PENDING', 'OVERDUE'),
      allowNull: false,
      defaultValue: 'PENDING',
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
    tableName: 'student_fees',
    timestamps: false,
  });
};

module.exports = StudentFees;
