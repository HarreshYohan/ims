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
    console.log('Starting comprehensive migration...');

    // 1. Syllabus table
    console.log('Ensuring syllabus table exists...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "syllabus" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
      );
    `);

    // 2. Syllabus associations
    console.log('Adding syllabusid to student and subject_tutor tables...');
    await sequelize.query('ALTER TABLE "student" ADD COLUMN IF NOT EXISTS "syllabusid" INTEGER REFERENCES syllabus(id) ON UPDATE CASCADE ON DELETE SET NULL;');
    await sequelize.query('ALTER TABLE "subject_tutor" ADD COLUMN IF NOT EXISTS "syllabusid" INTEGER REFERENCES syllabus(id) ON UPDATE CASCADE ON DELETE SET NULL;');

    // 3. Goals Table Updates (Checklist and Subject association)
    console.log('Updating goals table with checklist and subjecttutorid...');
    await sequelize.query('ALTER TABLE "goals" ADD COLUMN IF NOT EXISTS "checklist" JSONB DEFAULT \'[]\';');
    await sequelize.query('ALTER TABLE "goals" ADD COLUMN IF NOT EXISTS "subjecttutorid" INTEGER REFERENCES subject_tutor(id) ON UPDATE CASCADE ON DELETE SET NULL;');
    
    // Ensure targetdate and other fields from recent updates exist if they were missing
    await sequelize.query('ALTER TABLE "goals" ADD COLUMN IF NOT EXISTS "targetdate" DATE;');
    await sequelize.query('ALTER TABLE "goals" ADD COLUMN IF NOT EXISTS "progress" FLOAT DEFAULT 0;');
    await sequelize.query('ALTER TABLE "goals" ADD COLUMN IF NOT EXISTS "streak" INTEGER DEFAULT 0;');
    await sequelize.query('ALTER TABLE "goals" ADD COLUMN IF NOT EXISTS "lastprogressupdate" DATE;');

    // 4. Default Syllabuses
    console.log('Seeding default syllabuses...');
    const syllabuses = ['Local (Sri Lanka)', 'Cambridge', 'Edexcel'];
    for (const name of syllabuses) {
      await sequelize.query('INSERT INTO "syllabus" (name) VALUES (?) ON CONFLICT (name) DO NOTHING;', {
        replacements: [name]
      });
    }

    console.log('All migrations completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
