const { Grade } = require('./server/app/models');

async function seedGrades() {
  const customGrades = [
    'Pre School',
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12', 'Grade 13',
    'After O/L', 'After A/L'
  ];

  for (const name of customGrades) {
    try {
      const [grade, created] = await Grade.findOrCreate({
        where: { name }
      });
      if (created) {
        console.log(`Created custom grade: ${name}`);
      } else {
        console.log(`Grade already exists: ${name}`);
      }
    } catch (err) {
      console.error(`Error creating grade ${name}:`, err.message);
    }
  }
}

seedGrades().then(() => {
  console.log('Seeding custom grades completed.');
  process.exit(0);
});
