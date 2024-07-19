const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
    const Chatroom = sequelize.define("chatroom", {
      user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'User', 
            key: 'id',
          },
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subjecttutorid: {
        type: DataTypes.INTEGER,
        references: {
          model: 'SubjectTutor',
          key: 'id',
        },
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
      tableName: 'chatroom',
      timestamps: false,
    });
  
    return Chatroom;
  };
  