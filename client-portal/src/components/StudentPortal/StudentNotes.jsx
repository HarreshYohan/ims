import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Layout } from '../shared/Layout';
import { Card } from '../shared/Card';
import { Modal } from '../shared/Modal';
import { FormInput } from '../shared/FormInput';
import { FormSelect } from '../shared/FormSelect';
import { FileText, PlusCircle, Layers, CheckCircle, XCircle, Clock, Award, Edit3, Trash2 } from 'lucide-react';

export const StudentNotes = () => {
  const [userId, setUserId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ id: '', subject: '', chapter: '', heading: '', note: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' or 'EDIT'

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
      const res = await api.get(`/students/student-subject/${userId}`);
      const subjectsList = res.data?.data?.subjects || [];
      setSubjects(subjectsList);
      if (subjectsList.length > 0 && !selectedSubject) {
        setSelectedSubject(subjectsList[0].subject_id);
      }
    } catch (err) {
      console.error('Failed to fetch subjects', err);
    }
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const selectedSubObj = subjects.find(s => s.subject_id === selectedSubject);
      const subjectString = selectedSubObj ? (selectedSubObj.subjectName || selectedSubObj.subject) : '';
      const res = await api.get(`/notes/student/${userId}/${encodeURIComponent(subjectString)}`);
      setNotes(res.data || []);
    } catch (err) {
      console.error('Failed to fetch notes', err);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = useMemo(() => {
    return (
      form.chapter && form.chapter.trim() !== '' &&
      form.heading && form.heading.trim() !== '' &&
      form.note && form.note.trim() !== ''
    );
  }, [form]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const selectedSubObj = subjects.find(s => s.subject_id === selectedSubject);
      const subjectString = selectedSubObj ? (selectedSubObj.subjectName || selectedSubObj.subject) : '';
      
      if (modalMode === 'CREATE') {
        await api.post('/notes', { 
          ...form, 
          userid: userId, 
          subject: subjectString, 
          subjecttutorid: selectedSubject 
        });
        toast.success('Note submitted for approval');
      } else {
        await api.put(`/notes/${form.id}`, {
          chapter: form.chapter,
          heading: form.heading,
          note: form.note
        });
        toast.success('Note updated successfully');
      }
      
      setShowCreate(false);
      setForm({ id: '', subject: '', chapter: '', heading: '', note: '' });
      fetchNotes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNote = (note) => {
    setModalMode('EDIT');
    setForm({
      id: note.id,
      chapter: note.chapter,
      heading: note.heading,
      note: note.note
    });
    setShowCreate(true);
  };

  const openCreateModal = () => {
    setModalMode('CREATE');
    setForm({ id: '', subject: '', chapter: '', heading: '', note: '' });
    setShowCreate(true);
  };

  const handleGenerateFlashcards = async (noteId) => {
    try {
      const res = await api.post(`/flashcards/generate/${noteId}`, { userid: userId });
      toast.success(`Generated ${res.data.data?.length || 0} flashcards!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not generate flashcards.');
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      toast.success('Note deleted successfully');
      fetchNotes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete note');
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
            key={sub.subject_id}
            onClick={() => setSelectedSubject(sub.subject_id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              selectedSubject === sub.subject_id
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
            }`}
          >
            {sub.subject}
          </button>
        ))}
      </div>

      <Card
        title={`Notes — ${subjects.find(s => s.subject_id === selectedSubject)?.subject || 'Select a Subject'}`}
        action={
          <button onClick={openCreateModal} className="btn-primary">
            <PlusCircle size={18} /> Create Note
          </button>
        }
      >
        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <FileText size={48} className="mx-auto opacity-20 mb-3" />
            <p>No notes yet for this subject.</p>
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
                    <div className="flex flex-col items-end gap-2">
                      <div className={`flex items-center gap-1 ${cfg.color} text-xs font-bold`}>
                        <StatusIcon size={14} />
                        {note.status}
                      </div>
                      <div className="flex items-center gap-1">
                        {note.status === 'PENDING' && (
                          <button 
                            onClick={() => handleEditNote(note)}
                            className="p-1.5 text-primary hover:text-white transition-colors bg-primary/5 hover:bg-primary/20 rounded-lg"
                            title="Edit Note"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1.5 text-red-400 hover:text-white transition-colors bg-red-400/5 hover:bg-red-400/20 rounded-lg"
                          title="Delete Note"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={modalMode === 'CREATE' ? "Create New Note" : "Edit Note"}>
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
            <button 
              type="submit" 
              disabled={isSubmitting || !isFormValid} 
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : (modalMode === 'CREATE' ? 'Submit Note' : 'Save Changes')}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
