const { DataTypes } = require('sequelize');

const Transaction = (sequelize) => {
  return sequelize.define('Transaction', {
    transaction_type: {
        type: DataTypes.ENUM('SALARY', 'FEES', 'INCOME', 'EXPENSE', 'OTHER'),
        allowNull: false, 
        defaultValue: 'OTHER', 
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      participant_id: {
        type: DataTypes.INTEGER,
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
      tableName: 'transaction',
      timestamps: false,
    });
};

module.exports = Transaction;
  