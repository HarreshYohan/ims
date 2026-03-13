const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

async function createAdminTable() {
  try {
    console.log('Creating admin table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "admin" (
        user_id INTEGER PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
        firstname VARCHAR(255) NOT NULL,
        lastname VARCHAR(255) NOT NULL,
        contact VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
      );
    `);
    
    // Seed initial admin profile for user_id 1 if not exists
    const [existing] = await sequelize.query('SELECT user_id FROM "admin" WHERE user_id = 1');
    if (existing.length === 0) {
      console.log('Seeding initial admin profile...');
      await sequelize.query(`
        INSERT INTO "admin" (user_id, firstname, lastname, contact)
        VALUES (1, 'System', 'Administrator', '0000000000');
      `);
    }

    console.log('Admin table created and seeded.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin table:', err);
    process.exit(1);
  }
}

createAdminTable();
