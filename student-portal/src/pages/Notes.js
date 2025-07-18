import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './Notes.css';
import { jwtDecode } from 'jwt-decode';

function Notes() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedSubjectName, setSelectedSubjectName] = useState('');
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ heading: '', chapter: '', note: '' });
  const [studentId, setStudentId] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedNote, setEditedNote] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const decoded = jwtDecode(token);
    setStudentId(decoded.user_id);
  }, []);

  useEffect(() => {
    if (studentId) {
      api.get(`/student/student-subject/${studentId}`)
        .then((res) => {
          setSubjects(res.data.data?.subjects || []);
        })
        .catch(() => setSubjects([]));
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId && selectedSubjectName) {
      api.get(`/notes/student/${studentId}/${selectedSubjectName}`)
        .then((res) => setNotes(res.data))
        .catch(() => setNotes([]));
    } else {
      setNotes([]);
    }
    setActiveIndex(null);
  }, [studentId, selectedSubjectName]);

  const handleAddNote = async () => {
    if (!newNote.heading || !newNote.note || !newNote.chapter) return;
    const subjectSelected = subjects.find((s) => s.subject_id === parseInt(selectedSubjectId));
    if (!subjectSelected) return;
    try {
      const res = await api.post('/notes', {
        studentid: studentId,
        heading: newNote.heading,
        chapter: newNote.chapter,
        note: newNote.note,
        subject: subjectSelected.subject,
        subjecttutorid: selectedSubjectId,
      });
      setNotes([...notes, res.data]);
      setNewNote({ heading: '', chapter: '', note: '' });
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes(notes.filter((n) => n.id !== id));
      setActiveIndex(null);
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const handleSaveNote = async (note) => {
    if (!window.confirm('Are you sure you want to save the changes?')) return;
    try {
      await api.put(`/notes/${note.id}`, note);
      const updated = [...notes];
      updated[editingIndex] = { ...note };
      setNotes(updated);
      setEditingIndex(null);
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  return (
    <div className="notes-container">
      <h2>📘 My Study Notes</h2>

      <div className="subject-select">
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
      </div>

      {selectedSubjectId && (
        <div className="new-note-form">
          <h3>Add a New Note</h3>
          <input
            type="text"
            placeholder="Heading"
            value={newNote.heading}
            onChange={(e) => setNewNote({ ...newNote, heading: e.target.value })}
          />
          <input
            type="text"
            placeholder="Chapter"
            value={newNote.chapter}
            onChange={(e) => setNewNote({ ...newNote, chapter: e.target.value })}
          />
          <textarea
            placeholder="Your Study Note"
            value={newNote.note}
            onChange={(e) => setNewNote({ ...newNote, note: e.target.value })}
          />
          <button
            onClick={handleAddNote}
            disabled={!newNote.heading || !newNote.chapter || !newNote.note}
          >
            ➕ Add Note
          </button>
          {(!newNote.heading || !newNote.chapter || !newNote.note) && (
            <p style={{ color: 'red', marginTop: '5px' }}>* All fields are required</p>
          )}
        </div>
      )}

      <div className="notes-list">
        {notes.length === 0 && selectedSubjectName && <p>No notes yet for {selectedSubjectName}.</p>}

        {notes.map((note, idx) => (
          <div key={note.id} className="note-card">
            <div className="note-inner">
              {activeIndex === idx ? (
                <div className="note-back">
                  {editingIndex === idx ? (
                    <>
                      <div className="note-field">
                        <label>Heading</label>
                        <input
                          value={editedNote.heading}
                          onChange={(e) => setEditedNote({ ...editedNote, heading: e.target.value })}
                          placeholder="Heading"
                        />
                      </div>
                      <div className="note-field">
                        <label>Chapter</label>
                        <input
                          value={editedNote.chapter}
                          onChange={(e) => setEditedNote({ ...editedNote, chapter: e.target.value })}
                          placeholder="Chapter"
                        />
                      </div>
                      <div className="note-field">
                        <label>Note</label>
                        <textarea
                          value={editedNote.note}
                          onChange={(e) => setEditedNote({ ...editedNote, note: e.target.value })}
                          placeholder="Note Content"
                        />
                      </div>
                      <div className="note-actions">
                        <button className="edit"
                          onClick={() => handleSaveNote({ ...note, ...editedNote })}
                        >
                          💾 Save
                        </button>
                        <button className="close" onClick={() => setEditingIndex(null)}>❌ Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="note-field"><strong>Heading:</strong> {note.heading}</div>
                      <div className="note-field"><strong>Chapter:</strong> {note.chapter}</div>
                      <div className="note-field"><strong>Note:</strong> {note.note}</div>
                      <div className="note-field"><strong>Status:</strong> {note.status}</div>
                      <div className="note-field"><strong>Points:</strong> {note.points}</div>
                      <div className="note-actions">
                        <button className="edit" onClick={() => {
                          setEditingIndex(idx);
                          setEditedNote({ heading: note.heading, chapter: note.chapter, note: note.note });
                        }}>✏️ Edit</button>
                      </div>
                    </>
                  )}

                  <p className="note-date">📅 {new Date(note.createdAt).toLocaleString()}</p>

                  <div className="note-actions">
                    <button className="delete" onClick={() => handleDeleteNote(note.id)}>🗑 Delete</button>
                    <button className="close" onClick={() => setActiveIndex(null)}>❌ Close</button>
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
