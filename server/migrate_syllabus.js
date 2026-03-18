require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
  }
);

async function migrate() {
  try {
    console.log('Starting syllabus migration...');
    
    // Create syllabus table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "syllabus" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
      );
    `);
    
    // Add syllabusid to student
    await sequelize.query('ALTER TABLE "student" ADD COLUMN IF NOT EXISTS "syllabusid" INTEGER REFERENCES syllabus(id) ON UPDATE CASCADE ON DELETE SET NULL;');
    
    // Add syllabusid to subject_tutor
    await sequelize.query('ALTER TABLE "subject_tutor" ADD COLUMN IF NOT EXISTS "syllabusid" INTEGER REFERENCES syllabus(id) ON UPDATE CASCADE ON DELETE SET NULL;');

    // Insert default syllabuses
    const syllabuses = ['Local (Sri Lanka)', 'Cambridge', 'Edexcel'];
    for (const name of syllabuses) {
      await sequelize.query('INSERT INTO "syllabus" (name) VALUES (?) ON CONFLICT (name) DO NOTHING;', {
        replacements: [name]
      });
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
