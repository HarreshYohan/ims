require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: 'localhost', // Override for local execution
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
  }
);

async function migrate() {
  try {
    console.log('Starting migration to remove redundant columns...');
    
    // Drop username from student and staff tables if they exist
    await sequelize.query('ALTER TABLE "student" DROP COLUMN IF EXISTS "username";');
    await sequelize.query('ALTER TABLE "staff" DROP COLUMN IF EXISTS "username";');
    
    // Also drop password from student and staff if they exist
    await sequelize.query('ALTER TABLE "student" DROP COLUMN IF EXISTS "password";');
    await sequelize.query('ALTER TABLE "staff" DROP COLUMN IF EXISTS "password";');
    
    // Ensure tutor table is also clean
    await sequelize.query('ALTER TABLE "tutor" DROP COLUMN IF EXISTS "username";');
    await sequelize.query('ALTER TABLE "tutor" DROP COLUMN IF EXISTS "password";');

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
