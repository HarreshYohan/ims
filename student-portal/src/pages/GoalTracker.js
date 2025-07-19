import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import './GoalTracker.css';

const GoalTracker = () => {
  const [studentid, setStudentid] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedSubjectName, setSelectedSubjectName] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ goaltitle: '', targetdate: '', status: 'active' });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    const decoded = jwtDecode(token);
    setStudentid(decoded.user_id);
  }, []);

  useEffect(() => {
    if (studentid) {
         const userid = studentid
      api.get(`/goals/${userid}`)
        .then(res => setGoals(res.data))
        .catch(err => console.error(err));
    }
  }, [studentid]);

    useEffect(() => {
    if (studentid) {
      const userid = studentid
      api.get(`/student/student-subject/${userid}`)
        .then((res) => {
          setSubjects(res.data.data?.subjects || []);
        })
        .catch(() => setSubjects([]));
    }
  }, [studentid]);

  const handleAddGoal = async () => {
    if (!newGoal.goaltitle || !newGoal.targetdate) {
      alert('Please enter both goal title and target date.');
      return;
    }
    try {
      newGoal.status = 'active'; 
      newGoal.subjecttutorid = parseInt(selectedSubjectId);
      newGoal.userid = studentid;
      const res = await api.post('/goals', { ...newGoal, studentid });
      setGoals(prev => [...prev, res.data]);
      setNewGoal({ goaltitle: '', targetdate: '', status: 'active' });
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
        
        <label>Select Subject:</label>
        <select
          value={selectedSubjectId}
          onChange={(e) => {
            setSelectedSubjectId(e.target.value);
            const selected = subjects.find((s) => s.subject_id === parseInt(e.target.value));
            setSelectedSubjectName(selected ? selected.subject : '');
          }}
        >
          <option value="">-- Select --</option>
          {subjects.map((sub) => (
            <option key={sub.subject_id} value={sub.subject_id}>
              {sub.subject}
            </option>
          ))}
        </select>

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
              {/* <p>Status: <span className={`status-badge ${goal.status}`}>{goal.status}</span></p> */}
              <p>Status: {goal.status}
                
              </p>

              <div className="progress-bar-container" aria-label={`Progress: ${goal.progress}%`}>
                <div className="progress-bar" style={{ width: `${goal.progress}%` }}></div>
              </div>

              <p>Progress: {goal.progress.toFixed(0)}%</p>
              <p>Streak: {goal.streak} {goal.streak === 1 ? 'day' : 'days'}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GoalTracker;
