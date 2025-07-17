import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import './GoalTracker.css';

const GoalTracker = () => {
  const [studentid, setstudentid] = useState(null);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ goaltitle: '', targetdate: '' });
  const [customProgress, setCustomProgress] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const decoded = jwtDecode(token);
    setstudentid(decoded.user_id);
  }, []);

  useEffect(() => {
    if (studentid) {
      api.get(`//goals/${studentid}`)
        .then(res => setGoals(res.data))
        .catch(err => console.error(err));
    }
  }, [studentid]);

  const handleAddGoal = async () => {
    if (!newGoal.goaltitle || !newGoal.targetdate) {
      alert('Please enter both goal title and target date.');
      return;
    }
    try {
      const res = await api.post('/api/goals', { ...newGoal, studentid });
      setGoals(prev => [...prev, res.data]);
      setNewGoal({ goaltitle: '', targetdate: '' });
    } catch (err) {
      console.error(err);
    }
  };

const handleProgressChange = async (goal, newProgress, isIncrement = true) => {
  console.log(goal)
  if (newProgress > 100) newProgress = 100;
  if (newProgress < 0) newProgress = 0;

  let newStreak = goal.streak;
  if (isIncrement && newProgress > goal.progress) {
    newStreak += 1;
  } else if (!isIncrement && newProgress < goal.progress && newStreak > 0) {
    newStreak = newStreak - 1;
  }

  console.log(newStreak)
  try {
    const res = await api.put(`//goals/${goal.id}`, {
      progress: newProgress,
      streak: newStreak
    });
    setGoals(goals.map(g => (g.id === goal.id ? res.data : g)));
    setCustomProgress(prev => ({ ...prev, [goal.id]: '' }));
  } catch (err) {
    console.error(err);
  }
};


  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await api.delete(`//goals/${id}`);
      setGoals(goals.filter(g => g.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="goal-container">
      <h2>🎯 Study Goals</h2>

      <div className="goal-form">
        <input
          type="text"
          placeholder="Goal Title"
          value={newGoal.goaltitle}
          onChange={e => setNewGoal({ ...newGoal, goaltitle: e.target.value })}
        />
        <input
          type="date"
          value={newGoal.targetdate}
          onChange={e => setNewGoal({ ...newGoal, targetdate: e.target.value })}
        />
        <button onClick={handleAddGoal}>Add Goal</button>
      </div>

      <div className="goal-list">
        {goals.length === 0 ? (
          <p>No goals created yet.</p>
        ) : (
          goals.map(goal => (
            <div key={goal.id} className="goal-card">
              <h3>{goal.goaltitle}</h3>
              <p>Target Date: {new Date(goal.targetdate).toLocaleDateString()}</p>

              <div className="progress-bar-container" aria-label={`Progress: ${goal.progress}%`}>
                <div className="progress-bar" style={{ width: `${goal.progress}%` }}></div>
              </div>

              <p>Progress: {goal.progress.toFixed(0)}%</p>
              <p>Streak: {goal.streak} {goal.streak === 1 ? 'day' : 'days'}</p>

              <div className="goal-actions">
                <button className="button1" onClick={() => handleProgressChange(goal, goal.progress + 10, true)} disabled={goal.progress >= 100}>+10%</button>

                <button className="button2" onClick={() => handleProgressChange(goal, goal.progress - 10, false)} disabled={goal.progress <= 0}>-10%</button>

                <div className="custom-progress">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={customProgress[goal.id] || ''}
                    placeholder="Set %"
                    onChange={(e) => setCustomProgress(prev => ({ ...prev, [goal.id]: e.target.value }))}
                  />
                 <button
                    className="save"
                    onClick={() => {
                        const inputVal = parseFloat(customProgress[goal.id] || 0);
                        if (!isNaN(inputVal) && inputVal !== 0) {
                        handleProgressChange(goal, goal.progress + inputVal);
                        }
                    }}
                    >
                    Save
                </button>
                </div>

                <button className="delete" onClick={() => handleDeleteGoal(goal.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GoalTracker;
