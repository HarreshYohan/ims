import React, { useEffect, useState } from 'react';
import api from '../services/api'; // your axios instance
import {jwtDecode} from 'jwt-decode';
import './GoalTracker.css';

const GoalTracker = () => {
  const [studentid, setstudentid] = useState(null);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ goaltitle: '', targetdate: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const decoded = jwtDecode(token);
    setstudentid(decoded.user_id);
  }, []);

  useEffect(() => {
    if (studentid) {
      api.get(`/api/goals/${studentid}`)
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

  const handleProgressChange = async (goal, increment) => {
    let newProgress = goal.progress + increment;
    if (newProgress > 100) newProgress = 100;
    if (newProgress < 0) newProgress = 0;

    try {
      const res = await api.put(`/api/goals/${goal.id}`, { progress: newProgress });
      setGoals(goals.map(g => (g.id === goal.id ? res.data : g)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await api.delete(`/api/goals/${id}`);
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
                <div
                  className="progress-bar"
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>

              <p>Progress: {goal.progress.toFixed(0)}%</p>
              <p>Streak: {goal.streak} {goal.streak === 1 ? 'day' : 'days'}</p>

              <div className="goal-actions">
                <button
                  onClick={() => handleProgressChange(goal, +10)}
                  disabled={goal.progress >= 100}
                >
                  +10%
                </button>
                <button
                  onClick={() => handleProgressChange(goal, -10)}
                  disabled={goal.progress <= 0}
                >
                  -10%
                </button>
                <button onClick={() => handleDeleteGoal(goal.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GoalTracker;
