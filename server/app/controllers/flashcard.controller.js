const { Flashcard, Notes, Student } = require('../models');
const { Op } = require('sequelize');

// SM-2 Spaced Repetition Algorithm
function calculateSM2(quality, easeFactor, interval, repetitions) {
  // quality: 0-5 (0=complete fail, 5=perfect)
  let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  let newInterval, newReps;

  if (quality < 3) {
    newReps = 0;
    newInterval = 1;
  } else {
    newReps = repetitions + 1;
    if (newReps === 1) newInterval = 1;
    else if (newReps === 2) newInterval = 6;
    else newInterval = Math.round(interval * newEF);
  }

  return { easeFactor: newEF, interval: newInterval, repetitions: newReps };
}

// Create a flashcard
exports.create = async (req, res) => {
  try {
    const { userid, front, back, subject, noteid, difficulty } = req.body;

    const student = await Student.findOne({ where: { user_id: userid } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const card = await Flashcard.create({
      studentid: student.id,
      front,
      back,
      subject,
      noteid: noteid || null,
      difficulty: difficulty || 'MEDIUM',
      next_review: new Date().toISOString().slice(0, 10),
    });

    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Auto-generate flashcards from a note
exports.generateFromNote = async (req, res) => {
  try {
    const { noteid } = req.params;
    const { userid } = req.body;

    const student = await Student.findOne({ where: { user_id: userid } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const note = await Notes.findByPk(noteid);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    // Split note content into sentences and generate Q&A pairs
    const content = note.note || '';
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 15);

    if (sentences.length === 0) {
      return res.status(400).json({ message: 'Note content is too short to generate flashcards.' });
    }

    const cards = [];
    const today = new Date().toISOString().slice(0, 10);

    for (let i = 0; i < Math.min(sentences.length, 10); i++) {
      const sentence = sentences[i].trim();

      // Strategy 1: Fill-in-the-blank
      const words = sentence.split(' ');
      if (words.length >= 5) {
        const keywordIndex = Math.floor(words.length * 0.6);
        const keyword = words[keywordIndex];
        const front = words.map((w, idx) => idx === keywordIndex ? '________' : w).join(' ');

        cards.push({
          studentid: student.id,
          noteid: note.id,
          subject: note.subject,
          front: `Fill in the blank: ${front}`,
          back: keyword,
          difficulty: 'MEDIUM',
          next_review: today,
        });
      }

      // Strategy 2: "What is" question
      if (i < 5) {
        cards.push({
          studentid: student.id,
          noteid: note.id,
          subject: note.subject,
          front: `Explain: ${note.heading} — "${sentence.substring(0, 60)}..."`,
          back: sentence,
          difficulty: 'MEDIUM',
          next_review: today,
        });
      }
    }

    const created = await Flashcard.bulkCreate(cards);
    res.status(201).json({ message: `Generated ${created.length} flashcards`, data: created });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all flashcards for a student
exports.findByStudent = async (req, res) => {
  try {
    const { userid } = req.params;
    const { subject } = req.query;

    const student = await Student.findOne({ where: { user_id: userid } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const where = { studentid: student.id };
    if (subject) where.subject = subject;

    const cards = await Flashcard.findAll({
      where,
      order: [['next_review', 'ASC']],
      include: [{ model: Notes, as: 'note', attributes: ['heading', 'chapter'] }],
    });

    res.json({ data: cards, total: cards.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get cards due for review today
exports.getDueCards = async (req, res) => {
  try {
    const { userid } = req.params;
    const student = await Student.findOne({ where: { user_id: userid } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const today = new Date().toISOString().slice(0, 10);
    const cards = await Flashcard.findAll({
      where: {
        studentid: student.id,
        next_review: { [Op.lte]: today },
      },
      order: [['next_review', 'ASC']],
    });

    res.json({ data: cards, total: cards.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Review a card (SM-2 update)
exports.reviewCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { quality } = req.body; // 0-5

    if (quality === undefined || quality < 0 || quality > 5) {
      return res.status(400).json({ message: 'Quality must be between 0 and 5' });
    }

    const card = await Flashcard.findByPk(id);
    if (!card) return res.status(404).json({ message: 'Flashcard not found' });

    const { easeFactor, interval, repetitions } = calculateSM2(
      quality, card.ease_factor, card.interval, card.repetitions
    );

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    const difficulty = quality >= 4 ? 'EASY' : quality >= 3 ? 'MEDIUM' : 'HARD';

    await card.update({
      ease_factor: easeFactor,
      interval,
      repetitions,
      next_review: nextReview.toISOString().slice(0, 10),
      difficulty,
    });

    res.json({ message: 'Card reviewed', card, nextReviewIn: `${interval} days` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a flashcard
exports.delete = async (req, res) => {
  try {
    const card = await Flashcard.findByPk(req.params.id);
    if (!card) return res.status(404).json({ message: 'Flashcard not found' });
    await card.destroy();
    res.json({ message: 'Flashcard deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get flashcard stats for a student
exports.getStats = async (req, res) => {
  try {
    const { userid } = req.params;
    const student = await Student.findOne({ where: { user_id: userid } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const today = new Date().toISOString().slice(0, 10);
    const total = await Flashcard.count({ where: { studentid: student.id } });
    const due = await Flashcard.count({
      where: { studentid: student.id, next_review: { [Op.lte]: today } }
    });
    const mastered = await Flashcard.count({
      where: { studentid: student.id, repetitions: { [Op.gte]: 5 } }
    });

    res.json({ total, due, mastered, masteryPercent: total > 0 ? Math.round((mastered / total) * 100) : 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
