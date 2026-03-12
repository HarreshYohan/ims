import React, { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../../services/api';
import { Layout } from '../shared/Layout';
import { Card } from '../shared/Card';
import { Modal } from '../shared/Modal';
import { FormInput } from '../shared/FormInput';
import { FormSelect } from '../shared/FormSelect';
import { FileText, PlusCircle, Layers, CheckCircle, XCircle, Clock, Award } from 'lucide-react';

export const StudentNotes = () => {
  const [userId, setUserId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ subject: '', chapter: '', heading: '', note: '' });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded = jwtDecode(token);
      setUserId(decoded.user_id);
    }
  }, []);

  useEffect(() => {
    if (userId) fetchSubjects();
  }, [userId]);

  useEffect(() => {
    if (userId && selectedSubject) fetchNotes();
  }, [userId, selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const res = await api.get(`/student-subjects/student/${userId}`);
      const subs = (res.data || []).map(s => s.subject || s.subjectName || 'Unknown');
      const unique = [...new Set(subs)];
      setSubjects(unique);
      if (unique.length > 0 && !selectedSubject) setSelectedSubject(unique[0]);
    } catch (err) {
      console.error('Failed to fetch subjects', err);
    }
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/notes/student/${userId}/${selectedSubject}`);
      setNotes(res.data || []);
    } catch (err) {
      console.error('Failed to fetch notes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/notes', { ...form, userid: userId, subject: selectedSubject });
      setShowCreate(false);
      setForm({ subject: '', chapter: '', heading: '', note: '' });
      fetchNotes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateFlashcards = async (noteId) => {
    try {
      const res = await api.post(`/flashcards/generate/${noteId}`, { userid: userId });
      alert(`Generated ${res.data.data?.length || 0} flashcards!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not generate flashcards.');
    }
  };

  const statusConfig = {
    APPROVED: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
    REJECTED: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
    PENDING: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  };

  return (
    <Layout title="My Notes">
      {/* Subject Tabs */}
      <div className="flex flex-wrap gap-2 mb-2">
        {subjects.map(sub => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              selectedSubject === sub
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      <Card
        title={`Notes — ${selectedSubject || 'Select a Subject'}`}
        action={
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <PlusCircle size={18} /> Create Note
          </button>
        }
      >
        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <FileText size={48} className="mx-auto opacity-20 mb-3" />
            <p>No notes yet for {selectedSubject}.</p>
            <p className="text-xs mt-1">Create your first note to start building your knowledge base!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map(note => {
              const cfg = statusConfig[note.status] || statusConfig.PENDING;
              const StatusIcon = cfg.icon;
              return (
                <div key={note.id} className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4 space-y-3 transition-all hover:scale-[1.01]`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">{note.chapter}</p>
                      <h3 className="text-base font-bold text-white mt-0.5">{note.heading}</h3>
                    </div>
                    <div className={`flex items-center gap-1 ${cfg.color} text-xs font-bold`}>
                      <StatusIcon size={14} />
                      {note.status}
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">{note.note}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    {note.points > 0 && (
                      <span className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                        <Award size={14} /> +{note.points} XP
                      </span>
                    )}
                    {note.status === 'APPROVED' && (
                      <button
                        onClick={() => handleGenerateFlashcards(note.id)}
                        className="flex items-center gap-1 text-xs text-primary hover:text-white bg-primary/10 px-3 py-1.5 rounded-lg transition-colors font-medium"
                      >
                        <Layers size={14} /> Generate Flashcards
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Create Note Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Note">
        <form onSubmit={handleCreate}>
          <div className="space-y-4">
            <FormInput label="Chapter" name="chapter" value={form.chapter} onChange={e => setForm({ ...form, chapter: e.target.value })} required placeholder="e.g. Chapter 5 — Thermodynamics" />
            <FormInput label="Heading" name="heading" value={form.heading} onChange={e => setForm({ ...form, heading: e.target.value })} required placeholder="e.g. Laws of Thermodynamics" />
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Note Content</label>
              <textarea
                name="note"
                value={form.note}
                onChange={e => setForm({ ...form, note: e.target.value })}
                required
                rows={6}
                className="input-field resize-none"
                placeholder="Write your note content here. The more detailed, the better flashcards can be generated..."
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors font-medium">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : 'Submit Note'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
