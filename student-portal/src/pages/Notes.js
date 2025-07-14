import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './Notes.css';
import { jwtDecode } from 'jwt-decode';

function Notes() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ heading: '', chapter: '', note: '' });
  const [studentId, setStudentId] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const decoded = jwtDecode(token);
    setStudentId(decoded.user_id);
  }, []);

  useEffect(() => {
    if (studentId) {
      api.get(`/api/student/student-subject/${studentId}`)
        .then((res) => {
          setSubjects(res.data.data?.subjects.map((s) => s.subject) || []);
        })
        .catch(() => setSubjects([]));
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId && selectedSubject) {
      api.get(`/api/notes/student/${studentId}/${selectedSubject}`)
        .then((res) => setNotes(res.data));
    } else {
      setNotes([]);
    }
    setActiveIndex(null);
  }, [studentId, selectedSubject]);

  const handleAddNote = async () => {
    if (!newNote.heading || !newNote.note || !newNote.chapter) return;
    try {
      const res = await api.post('/api/notes', {
        studentid: studentId,
        subject: selectedSubject,
        heading: newNote.heading,
        chapter: newNote.chapter,
        note: newNote.note,
      });
      setNotes([...notes, res.data]);
      setNewNote({ heading: '', chapter: '', note: '' });
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes(notes.filter((n) => n.id !== id));
      setActiveIndex(null);
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const handleSaveNote = async (note) => {
    try {
      await api.put(`/notes/${note.id}`, note);
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  const handleEditNote = (index, field, value) => {
    const updated = [...notes];
    updated[index][field] = value;
    setNotes(updated);
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < notes.length - 1) {
      setActiveIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="notes-container">
      <h2>📘 My Study Notes</h2>

      <div className="subject-select">
        <label>Select Subject:</label>
        <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
          <option value="">-- Select --</option>
          {subjects.map((sub, idx) => (
            <option key={idx} value={sub}>{sub}</option>
          ))}
        </select>
      </div>

      {selectedSubject && (
        <div className="new-note-form">
          <h3>Add a New Note</h3>
          <input type="text" placeholder="Heading" value={newNote.heading} onChange={(e) => setNewNote({ ...newNote, heading: e.target.value })} />
          <input type="text" placeholder="Chapter" value={newNote.chapter} onChange={(e) => setNewNote({ ...newNote, chapter: e.target.value })} />
          <textarea placeholder="Your Study Note" value={newNote.note} onChange={(e) => setNewNote({ ...newNote, note: e.target.value })} />
          <button onClick={handleAddNote}>➕ Add Note</button>
        </div>
      )}

      <div className="notes-list">
        {notes.length === 0 && selectedSubject && <p>No notes yet for {selectedSubject}.</p>}

        {notes.map((note, idx) => (
          <div key={note.id} className={`note-card ${activeIndex === idx ? 'flipped' : ''}`}>
            <div className="note-inner">
              {activeIndex === idx ? (
                <div className="note-back">
                  <input value={note.heading} onChange={(e) => handleEditNote(idx, 'heading', e.target.value)} placeholder="Heading" />
                  <input value={note.chapter} onChange={(e) => handleEditNote(idx, 'chapter', e.target.value)} placeholder="Chapter" />
                  <textarea value={note.note} onChange={(e) => handleEditNote(idx, 'note', e.target.value)} placeholder="Note Content" />
                  <p className="note-date">📅 {new Date(note.createdAt).toLocaleString()}</p>
                  <div className="note-actions">
                    <button onClick={() => handleSaveNote(note)}>💾 Save</button>
                    <button onClick={() => handleDeleteNote(note.id)}>🗑 Delete</button>
                    <button onClick={() => setActiveIndex(null)}>❌ Close</button>
                    {/* <button onClick={handlePrev} disabled={idx === 0}>⬅ Prev</button>
                    <button onClick={handleNext} disabled={idx === notes.length - 1}>Next ➡</button> */}
                  </div>
                </div>
              ) : (
                <div className="note-front" onClick={() => setActiveIndex(idx)}>
                  <div className="note-content-center">
                    <div className="note-topic">{note.heading || 'No Heading'}</div>
                    <div className="note-chapter">{note.chapter || 'No Chapter'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notes;
