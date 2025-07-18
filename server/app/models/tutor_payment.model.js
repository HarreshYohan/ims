module.exports = (sequelize, DataTypes) => {
  const TutorPayment = sequelize.define('TutorPayment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tutorid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalpayment: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    received: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: false,
    },
    receiveddate: {
      type: DataTypes.DATE,
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
    tableName: 'tutor_payments',
    timestamps: true,
  });

  return TutorPayment;
};
