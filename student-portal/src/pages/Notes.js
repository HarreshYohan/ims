import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './Notes.css';

function Notes() {
  const [subjects, setSubjects] = useState(['Math', 'Science', 'English']);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ topic: '', subtopic: '', content: '' });

  useEffect(() => {
    if (selectedSubject) {
      api.get(`/notes?subject=${selectedSubject}`).then((res) => {
        setNotes(res.data);
      });
    }
  }, [selectedSubject]);

  const handleAddNote = () => {
    if (!newNote.topic || !newNote.content) return;

    const payload = {
      ...newNote,
      subject: selectedSubject,
      createdAt: new Date().toISOString()
    };

    api.post('/notes', payload).then(() => {
      setNotes([...notes, payload]);
      setNewNote({ topic: '', subtopic: '', content: '' });
    });
  };

  const handleDeleteNote = (index) => {
    // Replace with DELETE API when ready
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
  };

  const handleEditNote = (index, field, value) => {
    const updatedNotes = [...notes];
    updatedNotes[index][field] = value;
    setNotes(updatedNotes);
  };

  const handleSaveNote = (index) => {
    const note = notes[index];
    api.put(`/notes/${note.id}`, note); // Replace with real ID
  };

  return (
    <div className="notes-container">
      <h2>📘 My Study Notes</h2>

      <div className="subject-select">
        <label>Select Subject:</label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">-- Select --</option>
          {subjects.map((sub, i) => (
            <option key={i} value={sub}>{sub}</option>
          ))}
        </select>
      </div>

      {selectedSubject && (
        <div className="new-note-form">
          <h3>Add a New Note</h3>
          <input
            type="text"
            placeholder="Topic"
            value={newNote.topic}
            onChange={(e) => setNewNote({ ...newNote, topic: e.target.value })}
          />
          <input
            type="text"
            placeholder="Subtopic"
            value={newNote.subtopic}
            onChange={(e) => setNewNote({ ...newNote, subtopic: e.target.value })}
          />
          <textarea
            placeholder="Your Study Note"
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
          />
          <button onClick={handleAddNote}>➕ Add Note</button>
        </div>
      )}

      <div className="notes-list">
        {notes.length === 0 && selectedSubject && (
          <p className="no-notes">No notes yet for {selectedSubject}.</p>
        )}

        {notes.map((note, index) => (
          <div className="note-card" key={index}>
            <input
              className="note-topic"
              value={note.topic}
              onChange={(e) => handleEditNote(index, 'topic', e.target.value)}
            />
            <input
              className="note-subtopic"
              value={note.subtopic}
              onChange={(e) => handleEditNote(index, 'subtopic', e.target.value)}
            />
            <textarea
              className="note-content"
              value={note.content}
              onChange={(e) => handleEditNote(index, 'content', e.target.value)}
            />
            <p className="note-date">
              📅 {new Date(note.createdAt).toLocaleString()}
            </p>
            <div className="note-actions">
              <button onClick={() => handleSaveNote(index)}>💾 Save</button>
              <button onClick={() => handleDeleteNote(index)}>🗑 Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notes;
