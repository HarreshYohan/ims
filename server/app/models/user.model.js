const { DataTypes } = require('sequelize');

const User = (sequelize) => {
  return sequelize.define("User", {
    username: {
      type: DataTypes.STRING,
      allowNull: false, 
    },
    user_type: {
      type: DataTypes.ENUM('ADMIN', 'STUDENT', 'TUTOR', 'NA', 'STAFF'),
      allowNull: false, 
      defaultValue: 'NA', 
    },
    user_type_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'staff', 
        key: 'id',
      },
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
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
    tableName: 'user',
    underscored: true,
    timestamps: false, 
  });
};

module.exports = User;
