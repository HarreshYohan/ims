const { QuizAttempt, Notes, Student } = require('../models');
const { Op } = require('sequelize');

// Generate a quiz from a student's notes
exports.generate = async (req, res) => {
  try {
    const { userid } = req.params;
    const { subject, count = 10 } = req.query;

    const student = await Student.findOne({ where: { user_id: userid } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const where = { 
      studentid: student.id, 
      status: { [Op.or]: ['APPROVED', 'Approved'] }
    };
    if (subject) where.subject = subject;

    const notes = await Notes.findAll({ where, order: [['id', 'ASC']] });

    if (notes.length < 3) {
      return res.status(400).json({ message: 'Not enough approved notes to generate a quiz. You need at least 3.' });
    }

    // Generate questions from notes
    const questions = [];
    const shuffled = [...notes].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(parseInt(count), 20));

    for (const note of selected) {
      const content = note.note || '';
      const words = content.split(' ').filter(w => w.length > 3);

      if (words.length < 3) continue;

      // Strategy: Fill-in-the-blank
      const keyIdx = Math.floor(Math.random() * Math.min(words.length, 10));
      const answer = words[keyIdx];
      const blanked = words.map((w, i) => i === keyIdx ? '________' : w).join(' ');

      // Generate wrong answers from other notes
      const otherNotes = notes.filter(n => n.id !== note.id);
      const distractors = [];
      for (const other of otherNotes.slice(0, 3)) {
        const otherWords = (other.note || '').split(' ').filter(w => w.length > 3);
        if (otherWords.length > 0) {
          distractors.push(otherWords[Math.floor(Math.random() * otherWords.length)]);
        }
      }

      // Ensure we have 3 distractors
      while (distractors.length < 3) {
        distractors.push(`option_${distractors.length + 1}`);
      }

      const options = [answer, ...distractors.slice(0, 3)].sort(() => Math.random() - 0.5);

      questions.push({
        id: note.id,
        subject: note.subject,
        chapter: note.chapter,
        question: `[${note.heading}] Fill in the blank:\n"${blanked.substring(0, 200)}"`,
        options,
        correctAnswer: answer,
      });
    }

    res.json({ data: questions, total: questions.length, subject: subject || 'All Subjects' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Submit quiz results
exports.submit = async (req, res) => {
  try {
    const { userid, subject, total_questions, correct_answers, time_taken_seconds } = req.body;

    const student = await Student.findOne({ where: { user_id: userid } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const score_percent = total_questions > 0 ? Math.round((correct_answers / total_questions) * 100) : 0;

    const attempt = await QuizAttempt.create({
      studentid: student.id,
      subject: subject || 'Mixed',
      total_questions,
      correct_answers,
      score_percent,
      time_taken_seconds: time_taken_seconds || null,
    });

    res.status(201).json({
      message: 'Quiz submitted successfully',
      attempt,
      grade: score_percent >= 90 ? 'A+' : score_percent >= 80 ? 'A' : score_percent >= 70 ? 'B' : score_percent >= 60 ? 'C' : 'Needs Improvement'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get quiz history for a student
exports.getHistory = async (req, res) => {
  try {
    const { userid } = req.params;
    const student = await Student.findOne({ where: { user_id: userid } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const attempts = await QuizAttempt.findAll({
      where: { studentid: student.id },
      order: [['created_at', 'DESC']],
      limit: 50,
    });

    // Calculate trends
    const avgScore = attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.score_percent, 0) / attempts.length)
      : 0;

    const bestScore = attempts.length > 0
      ? Math.max(...attempts.map(a => a.score_percent))
      : 0;

    res.json({
      data: attempts,
      total: attempts.length,
      stats: { avgScore, bestScore, totalQuizzes: attempts.length }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
