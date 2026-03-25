const { Goals, Student, Tutor, SubjectTutor } = require('../models');
const { Op } = require('sequelize');

exports.getGoalsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const goals = await Goals.findAll({ 
      where: { studentid : studentId },
      order: [['createdAt', 'DESC']]
    });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createGoal = async (req, res) => {  
  try {
    const { userid, goaltitle, targetdate, subjecttutorid, checklist } = req.body;

    if (!userid || !goaltitle || !targetdate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const student = await Student.findOne({where: {user_id : userid}});
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    const studentid = student.id;
    
    // Parse targetdate (YYYY-MM-DD) as a local date at midnight
    const [year, month, day] = targetdate.split('-').map(Number);
    const target = new Date(year, month - 1, day);
    target.setHours(0, 0, 0, 0);

    // Get today's date at midnight (local time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validation: Future date (at least tomorrow)
    if (target <= today) {
      return res.status(400).json({ error: 'Mission deadline must be a future date (starting from tomorrow).' });
    }

    // Validation: Realistic date (max 6 months)
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6);
    maxDate.setHours(23, 59, 59, 999);

    if (target > maxDate) {
      return res.status(400).json({ error: 'Target date is too far in the future. Please set a realistic mission (within 6 months).' });
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    const newGoal = await Goals.create({ 
      studentid, 
      goaltitle, 
      targetdate, 
      lastprogressupdate: todayStr,
      subjecttutorid,
      checklist: checklist || []
    });

    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.generateAIChecklist = async (req, res) => {
  try {
    const { goaltitle, userid, chapter, subtopics } = req.body;
    const { generateStudyChecklist } = require('../services/ai.service');
    
    const student = await Student.findOne({ where: { user_id: userid } });
    const grade = student?.grade || 'Standard';
    
    const checklist = await generateStudyChecklist(goaltitle, grade, chapter, subtopics);
    res.json({ checklist });
  } catch (error) {
    res.status(500).json({ message: 'AI Generation failed' });
  }
};

exports.toggleChecklistItem = async (req, res) => {
  const t = await Goals.sequelize.transaction();
  try {
    const { id } = req.params;
    const { itemId } = req.body;

    const goal = await Goals.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!goal) {
      await t.rollback();
      return res.status(404).json({ message: 'Goal not found' });
    }

    console.log('BACKEND TOGGLE:', { id, itemId, currentChecklist: goal.checklist });
    let checklist = JSON.parse(JSON.stringify(goal.checklist || [])); // Deep clone to avoid mutation issues
    const itemIndex = checklist.findIndex(i => String(i.id) === String(itemId));
    
    if (itemIndex > -1) {
      checklist[itemIndex].completed = !checklist[itemIndex].completed;
      console.log('MODIFIED ITEM:', checklist[itemIndex]);
      
      const completedCount = checklist.filter(i => i.completed).length;
      const progress = Math.round((completedCount / checklist.length) * 100);
      
      const today = new Date().toISOString().slice(0, 10);
      let status = progress >= 100 ? 'Completed' : 'Active';

      await goal.update({ checklist, progress, status, lastprogressupdate: today }, { transaction: t });
      await t.commit();
      res.json({ message: 'Checklist updated', goal });
    } else {
      await t.rollback();
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    if (t) await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;

    const goal = await Goals.findByPk(id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    const today = new Date().toISOString().slice(0, 10);
    let newStreak = goal.streak;

    if (progress !== undefined) {
      if (goal.lastprogressupdate !== today) {
        newStreak += 1;
      }

      await goal.update({
        progress,
        streak: newStreak,
        lastprogressupdate: today,
      });
    } else {
      await goal.update(req.body);
    }

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Goals.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ message: 'Goal not found' });
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getActiveGoalsCount = async (req, res) => {
  try {
    const { studentid } = req.params;
    let sid = parseInt(studentid);

    // If the ID doesn't exist as a student ID, check if it's a User ID
    const { Op } = require('sequelize');
    const student = await Student.findOne({
      where: { [Op.or]: [{ id: sid }, { user_id: sid }] }
    });

    if (!student) return res.status(404).json({ message: 'Student not found' });

    const count = await Goals.count({
      where: { studentid: student.id, progress: { [Op.lt]: 100 } },
    });
    res.json({ activeGoals: count });
  } catch (error) {
    console.error('Error in getActiveGoalsCount:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

exports.getStreak = async (req, res) => {
  try {
    const { studentid } = req.params;
    let sid = parseInt(studentid);

    const { Op } = require('sequelize');
    const student = await Student.findOne({
      where: { [Op.or]: [{ id: sid }, { user_id: sid }] }
    });

    if (!student) return res.status(404).json({ message: 'Student not found' });

    const goals = await Goals.findAll({ where: { studentid: student.id } });

    if (!goals || goals.length === 0) {
      return res.json({ average_streak: 0 });
    }

    const totalStreak = (goals || []).reduce((sum, g) => sum + (Number(g?.streak) || 0), 0);
    const averageStreak = totalStreak / goals.length;

    res.json({ average_streak: isNaN(averageStreak) ? 0 : averageStreak.toFixed(2) });
  } catch (err) {
    console.error('Error in getStreak:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

exports.getGoalsByTutorSubjectGrade = async (req, res) => {
  try {
    const { userid, subject, grade } = req.query;

    const tutor = await Tutor.findOne({
      where: { user_id: userid },
      attributes: ['id']
    });
    if (!tutor) return res.status(404).json({ message: 'Tutor not found' });
    const tutorid = tutor.id;

    const st = await SubjectTutor.findOne({
      where: { subjectid : subject ,gradeid: grade },
      attributes: ['id']
    });
    if (!st) return res.status(404).json({ message: 'Subject-Tutor mapping not found' });
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
    res.status(500).json({ message: error.message });
  }
};

exports.updateGoalProgress = async (req, res) => {
  const t = await Goals.sequelize.transaction();
  try {
    const { id } = req.params;
    const { progress } = req.body;

    if (progress < 0 || progress > 100) {
      await t.rollback();
      return res.status(400).json({ message: 'Progress must be between 0 and 100' });
    }

    // Use lock for concurrent safety
    const goal = await Goals.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!goal) {
      await t.rollback();
      return res.status(404).json({ message: 'Goal not found' });
    }

    const today = new Date().toISOString().slice(0, 10);
    let newStreak = goal.streak;

    if (goal.lastprogressupdate !== today) {
      newStreak += 1;
    }

    const status = progress >= 100 ? 'Completed' : 'Active';

    await goal.update({ progress, streak: newStreak, lastprogressupdate: today, status }, { transaction: t });
    await t.commit();

    res.json({ message: 'Progress updated successfully', goal });
  } catch (error) {
    if (t) await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

exports.getActiveTutorGoalsCount = async (req, res) => {
  const { userid } = req.params;

  const tutor = await Tutor.findOne({
    where: { user_id: userid },
    attributes: ['id']
  });
  if (!tutor) return res.status(404).json({ message: 'Tutor not found' });
  const tutorid = tutor.id;

  const st = await SubjectTutor.findAll({
    where: { tutorid: tutorid },
    attributes: ['id']
  });

  const { Op } = require('sequelize');
  const subjectTutorIds = st.map(s => s.id);
  const count = await Goals.count({
    where: { subjecttutorid : subjectTutorIds, progress: { [Op.lt]: 100 } },
  });
  res.json({ activeGoals: count });
};