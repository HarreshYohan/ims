const bcrypt = require('bcryptjs');

const passwords = ['admin123', 'staff123', 'tutor123', 'student123'];

passwords.forEach(pw => {
  const hash = bcrypt.hashSync(pw, 10);
  console.log(`${pw}: ${hash}`);
});
