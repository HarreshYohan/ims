const { DataTypes } = require('sequelize');

const User = (sequelize) => {
  return sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false, 
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false, 
      unique: true,
      validate: {
        isEmail: true, 
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false, 
    },
    user_type: {
      type: DataTypes.ENUM('ADMIN', 'STUDENT', 'TUTOR', 'NA', 'STAFF'),
      allowNull: false, 
      defaultValue: 'NA', 
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
