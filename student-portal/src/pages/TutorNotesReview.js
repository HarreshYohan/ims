import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './Notes.css';
import { jwtDecode } from 'jwt-decode';

function TutorNotesReview() {
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [notes, setNotes] = useState([]);
  const [tutorId, setTutorId] = useState('');
  const [reviewedNotes, setReviewedNotes] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
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
      api.get(`/notes/tutor/notes-for-approval?tutorid=${tutorId}&subject=${selectedSubject}&grade=${selectedGrade}`)
        .then(res => setNotes(res.data))
        .catch(() => setNotes([]));
    } else {
      setNotes([]);
    }
  }, [tutorId, selectedSubject, selectedGrade]);

const handleReview = async (note, status) => {
  if (status === 'APPROVED') {
    let input = prompt('Points to award (0.1 - 9.9):', note.points || 0);
    if (input === null) return;

    let points = parseFloat(input);
    if (isNaN(points) || points <= 0 || points >= 10) {
      alert('❗ Please enter a valid decimal number between 0 and 10.');
      return;
    }

    if (!window.confirm(`Confirm approving this note with ${points} points?`)) return;

    try {
      await api.put(`/notes/tutor/review-note/${note.id}`, { status, points });
      setNotes(notes.filter(n => n.id !== note.id));
      setReviewedNotes([...reviewedNotes, { ...note, status, points }]);
    } catch (err) {
      console.error('Review failed:', err);
    }
  } else if (status === 'REJECTED') {
    if (!window.confirm('Confirm rejecting this note?')) return;

    try {
      await api.put(`/notes/tutor/review-note/${note.id}`, { status, points: 0 });
      setNotes(notes.filter(n => n.id !== note.id));
      setReviewedNotes([...reviewedNotes, { ...note, status, points: 0 }]);
    } catch (err) {
      console.error('Review failed:', err);
    }
  }
};



  return (
    <div className="notes-container">
      <h2>📑 Review Student Notes</h2>

      <div className="subject-select">
        <label>Subject:</label>
        <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
          <option value="">-- Select Subject --</option>
          {subjects.map(s => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>

        <label style={{ marginLeft: '20px' }}>Grade:</label>
        <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}>
          <option value="">-- Select Grade --</option>
          {grades.map(g => (
            <option key={g.id} value={g.name}>{g.name}</option>
          ))}
        </select>
      </div>

      <div className="notes-list">
        {notes.length === 0 && selectedSubject && selectedGrade && (
          <p>No pending notes for this selection.</p>
        )}

        {notes.map((note) => (
          <div key={note.id} className="note-card">
            <div className="note-back">
              <div className="note-field"><strong>Heading:</strong> {note.heading}</div>
              <div className="note-field"><strong>Chapter:</strong> {note.chapter}</div>
              <div className="note-field"><strong>Note:</strong> {note.note}</div>
              <div className="note-date">📅 {new Date(note.createdAt).toLocaleDateString()}</div>

              <div className="note-actions">
                <button className="edit" onClick={() => handleReview(note, 'APPROVED')}>
                  ✅ Approve
                </button>
                <button className="delete" onClick={() => handleReview(note, 'REJECTED')}>
                  ❌ Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {reviewedNotes.length > 0 && (
  <div className="reviewed-notes-table">
    <h3>✅ Reviewed Notes</h3>
    <table className="fees-table">
      <thead>
        <tr>
          <th>Heading</th>
          <th>Chapter</th>
          <th>Note</th>
          <th>Status</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {reviewedNotes.map((n) => (
          <tr key={n.id}>
            <td>{n.heading}</td>
            <td>{n.chapter}</td>
            <td>{n.note}</td>
            <td>{n.status}</td>
            <td>{n.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

    </div>
  );
}

export default TutorNotesReview;
