const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

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

async function fixPasswords() {
  try {
    console.log('Starting password hashing migration...');
    
    const [users] = await sequelize.query('SELECT id, password FROM "user";');
    
    for (const user of users) {
      // Check if it's already a bcrypt hash (starts with $2a$ or $2b$)
      if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        console.log(`Hashing password for user ID: ${user.id}`);
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await sequelize.query('UPDATE "user" SET password = :password WHERE id = :id', {
          replacements: { password: hashedPassword, id: user.id }
        });
      }
    }

    console.log('Password migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Password migration failed:', err);
    process.exit(1);
  }
}

fixPasswords();
