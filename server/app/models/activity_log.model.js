module.exports = (sequelize, DataTypes) => {
  const ActivityLog = sequelize.define('ActivityLog', {
    id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id:   { type: DataTypes.INTEGER, allowNull: true },
    username:  { type: DataTypes.STRING(255), allowNull: true },
    email:     { type: DataTypes.STRING(255), allowNull: true },
    role:      { type: DataTypes.STRING(50), allowNull: true },
    action:    { type: DataTypes.STRING(50), allowNull: false },      // LOGIN, LOGOUT, CREATE, UPDATE, DELETE
    entity:    { type: DataTypes.STRING(100), allowNull: true },      // student, classroom, timetable, etc.
    entity_id: { type: DataTypes.INTEGER, allowNull: true },
    details:   { type: DataTypes.TEXT, allowNull: true },             // Human-readable description
    ip_address:{ type: DataTypes.STRING(50), allowNull: true },
    created_at:{ type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'activity_log',
    timestamps: false,
  });

  return ActivityLog;
};
