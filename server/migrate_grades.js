require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

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
    console.log('Starting Grade 16 to Grade 11 migration...');

    // 1. Find IDs for Grade 11 and Grade 16
    const [grade11] = await sequelize.query("SELECT id FROM grade WHERE name = 'Grade 11'");
    const [grade16] = await sequelize.query("SELECT id FROM grade WHERE name = 'Grade 16'");

    const g11 = grade11[0];
    const g16 = grade16[0];

    if (!g16) {
      console.log('Grade 16 not found in grade table. Checking student table strings...');
    } else {
        if (g11) {
            console.log(`Both Grade 11 (ID: ${g11.id}) and Grade 16 (ID: ${g16.id}) exist. Merging...`);
            
            // Update SubjectTutor references
            await sequelize.query('UPDATE subject_tutor SET gradeid = ? WHERE gradeid = ?', {
                replacements: [g11.id, g16.id]
            });
            
            // Delete Grade 16
            await sequelize.query('DELETE FROM grade WHERE id = ?', {
                replacements: [g16.id]
            });
            console.log('Grade 16 merged into Grade 11 in management tables.');
        } else {
            console.log(`Grade 16 (ID: ${g16.id}) exists but Grade 11 does not. Renaming...`);
            await sequelize.query("UPDATE grade SET name = 'Grade 11' WHERE id = ?", {
                replacements: [g16.id]
            });
            console.log('Grade 16 renamed to Grade 11.');
        }
    }

    // 2. Update Student table (uses string names)
    console.log('Updating student table strings...');
    const [updateStudents] = await sequelize.query("UPDATE student SET grade = 'Grade 11' WHERE grade = 'Grade 16'");
    console.log(`Updated students: ${updateStudents.rowCount || 'Check logs'}`);

    // double check any other references? 
    // SubjectTutor also has a 'grade' column in some previous versions? 
    // Let's check columns for subject_tutor
    const [cols] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'subject_tutor'");
    const columnNames = cols.map(c => c.column_name);
    if (columnNames.includes('grade')) {
        await sequelize.query("UPDATE subject_tutor SET grade = 'Grade 11' WHERE grade = 'Grade 16'");
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
