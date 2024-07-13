const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: true,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.tutorials = require("./tutorial.model.js")(sequelize, Sequelize);
<<<<<<< Updated upstream
db.users = require("./users.model.js")(sequelize, Sequelize);
=======
db.users = require("./user.model.js")(sequelize, Sequelize);
db.teacher = require("./teacher.model.js")(sequelize, Sequelize);
db.timetable = require("./timetable.model.js")(sequelize, Sequelize);
>>>>>>> Stashed changes

module.exports = db;