const { DataTypes } = require('sequelize');

const StaffLeaveRequest = (sequelize) => {
  return sequelize.define('StaffLeaveRequest', {
    staff_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'staffs', key: 'id' }
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'PENDING'
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
    tableName: 'staff_leave_requests',
    timestamps: true
  });
};

module.exports = StaffLeaveRequest;
