import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import './TutorGoalsReview.css';

function TutorGoalsReview() {
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [goals, setGoals] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [tutorId, setTutorId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    const decoded = jwtDecode(token);
    setTutorId(decoded.user_id);

    api.get(`/notes/subjects-grades/${decoded.user_id}`)
      .then(res => {
        setSubjects(res.data.subjects);
        setGrades(res.data.grades);
      }).catch(() => {
        setSubjects([]);
        setGrades([]);
      });
  }, []);

  useEffect(() => {
    if (tutorId && selectedSubject && selectedGrade) {
      api.get(`/goals/tutor/goals?userid=${tutorId}&subject=${selectedSubject}&grade=${selectedGrade}`)
        .then(res => setGoals(res.data))
        .catch(() => setGoals([]));
    } else {
      setGoals([]);
    }
  }, [tutorId, selectedSubject, selectedGrade]);

  const handleUpdateProgress = async (goalId, currentProgress) => {
    let input = prompt('Enter new progress (0 - 100):', currentProgress);
    if (input === null) return;
    let progress = parseFloat(input);
    if (isNaN(progress) || progress < 0 || progress > 100) {
      alert('Invalid progress value');
      return;
    }
    if (!window.confirm(`Confirm updating progress to ${progress}%?`)) return;

    try {
      await api.put(`/goals/tutor/update-goal/${goalId}`, { progress });
      setGoals(goals.map(g => g.id === goalId ? { ...g, progress, status: progress >= 100 ? 'Completed' : 'Active' } : g));
    } catch (err) {
      console.error('Error updating goal:', err);
    }
  };

  return (
    <div className="goals-container">
      <h2>🎯 Student Goals Review</h2>

      <div className="goal-filters">
        <label>Subject:</label>
        <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
          <option value="">-- Select Subject --</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <label>Grade:</label>
        <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}>
          <option value="">-- Select Grade --</option>
          {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      <div className="goals-table-wrapper">
        <table className="goals-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Goal</th>
              <th>Progress</th>
              <th>Streak</th>
              <th>Last Updated</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {goals.map(goal => (
              <tr key={goal.id}>
                <td>{goal.studentName}</td>
                <td>{goal.goaltitle}</td>
                <td>{goal.progress}%</td>
                <td>{goal.streak}</td>
                <td>{goal.lastprogressupdate}</td>
                <td>{goal.status}</td>
                <td>
                  <button
                    disabled={goal.status === 'Completed'}
                    onClick={() => handleUpdateProgress(goal.id, goal.progress)}
                  >
                    ✏️ Update
                  </button>
                </td>
              </tr>
            ))}
            {goals.length === 0 && <tr><td colSpan="7">No goals found for selection.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TutorGoalsReview;
