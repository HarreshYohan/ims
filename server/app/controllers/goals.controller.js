const { Goals, Student, Tutor, SubjectTutor } = require('../models');
const { Op } = require('sequelize');

exports.getGoalsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const goals = await Goals.findAll({ where: { studentid :studentId } ,order: [['createdAt', 'DESC']]});
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createGoal = async (req, res) => {  
  try {

    const { userid, goaltitle, targetdate, subjecttutorid } = req.body;

    if (!userid || !goaltitle || !targetdate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const student = await Student.findOne({where: {user_id : userid}}, {attributes: ['id']})
    const studentid = student.id
    const lastprogressupdate = new Date().toISOString().slice(0, 10); 
    const newGoal = await Goals.create({ studentid, goaltitle, targetdate, lastprogressupdate , subjecttutorid});
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;

    const goal = await Goals.findByPk(id);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    const today = new Date().toISOString().slice(0, 10);
    let newStreak = goal.streak;

    if (progress !== undefined) {
      if (goal.lastprogressupdate !== today) {
        newStreak += 1;
      }

      await goal.update({
        progress,
        streak: newStreak,
        lastProgressUpdate: today,
      });
    } else {
      await goal.update(req.body);
    }

    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Goals.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: 'Goal not found' });
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActiveGoalsCount = async (req, res) => {
  const { studentid } = req.params;
  const count = await Goals.count({
    where: { studentid : studentid, progress: { [Op.lt]: 100 } },
  });
  res.json({ activeGoals: count });
};

exports.getStreak = async (req, res) => {
  const { studentid } = req.params;
  try {
    const goals = await Goals.findAll({ where: { studentid } });

    if (!goals || goals.length === 0) {
      return res.json({ average_streak: 0 });
    }

    const totalStreak = goals.reduce((sum, goal) => sum + (goal.streak || 0), 0);
    const averageStreak = totalStreak / goals.length;

    res.json({ average_streak: averageStreak.toFixed(2) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGoalsByTutorSubjectGrade = async (req, res) => {
  try {
    const { userid, subject, grade } = req.query;

    const tutor = await Tutor.findOne({where: {user_id : userid}}, {attributes: ['id']})
    const tutorid = tutor.id

    const st = await SubjectTutor.findOne({where: {subjectid : subject ,gradeid: grade}}, {attributes: ['id']})
    const subjecttutorid = st.id

    const goals = await Goals.findAll({
      where: { subjecttutorid: subjecttutorid },
      include: [{
        model: Student, as: 'student',
        attributes: ['id', 'firstname' , 'lastname'],
      }],
      order: [['createdAt', 'DESC']],
    });

    const formatted = goals.map(g => ({
      id: g.id,
      studentName: g.student.firstname + " "+g.student.lastname,
      goaltitle: g.goaltitle,
      progress: g.progress,
      streak: g.streak,
      lastprogressupdate: g.lastprogressupdate,
      status: g.status,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateGoalProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;

    if (progress < 0 || progress > 100) {
      return res.status(400).json({ error: 'Progress must be between 0 and 100' });
    }

    const goal = await Goals.findByPk(id);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    const today = new Date().toISOString().slice(0, 10);
    let newStreak = goal.streak;

    if (goal.lastprogressupdate !== today) {
      newStreak += 1;
    }

    const status = progress >= 100 ? 'Completed' : 'Active';

    await goal.update({ progress, streak: newStreak, lastprogressupdate: today, status });

    res.json({ message: 'Progress updated successfully', goal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActiveTutorGoalsCount = async (req, res) => {
  const { userid } = req.params;

  const tutor = await Tutor.findOne({where: {user_id : userid}}, {attributes: ['id']})
  const tutorid = tutor.id

  const st = await SubjectTutor.findAll({where: {tutorid:tutorid}}, {attributes: ['id']})

  const subjectTutorIds = st.map(s => s.id);
  const count = await Goals.count({
    where: { subjecttutorid : subjectTutorIds, progress: { [Op.lt]: 100 } },
  });
  res.json({ activeGoals: count });
};