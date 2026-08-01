const { SubjectTutor, Subject, Grade, Syllabus, Tutor } = require('./server/app/models');

async function test() {
  const mappings = await SubjectTutor.findAll({
    include: [
      { model: Subject, as: 'subject' },
      { model: Grade, as: 'grade' },
      { model: Syllabus, as: 'syllabus' }
    ]
  });
  console.log(JSON.stringify(mappings, null, 2));
}

test();
