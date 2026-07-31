import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Layout } from '../shared/Layout';
import { Card } from '../shared/Card';
import { GenericTable } from '../shared/GenericTable';
import { Modal } from '../shared/Modal';
import { FileText, Eye, CheckCircle, XCircle } from 'lucide-react';

export const TutorNotesApprovals = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const decoded = jwtDecode(token);
      
      const res = await api.get(`/notes/tutor/notes-for-approval?userid=${decoded.user_id}`);
      setNotes(res.data || []);
    } catch (err) {
      console.error('Failed to fetch pending notes:', err);
      toast.error('Could not load notes pending approval.');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status) => {
    if (!selectedNote) return;
    
    // As requested, default points to 10 for approved notes
    const points = status === 'APPROVED' ? 10 : 0;
    
    setIsSubmitting(true);
    try {
      await api.put(`/notes/tutor/review-note/${selectedNote.id}`, { status, points });
      toast.success(`Note ${status.toLowerCase()} successfully!`);
      setIsModalOpen(false);
      setSelectedNote(null);
      fetchNotes();
    } catch (err) {
      console.error('Error reviewing note:', err);
      toast.error('Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { 
      label: 'Title', 
      accessor: 'heading', 
      render: (val) => <span className="font-semibold text-white flex items-center gap-2"><FileText size={16} className="text-primary" /> {val}</span> 
    },
    { 
      label: 'Student', 
      accessor: 'student', 
      render: (val, row) => <span className="text-slate-300">{row.student?.firstname} {row.student?.lastname}</span> 
    },
    { 
      label: 'Subject', 
      accessor: 'subjectTutor', 
      render: (val, row) => <span className="text-slate-400">{row.subjectTutor?.subject?.name} ({row.subjectTutor?.grade?.name})</span> 
    },
    { 
      label: 'Status', 
      accessor: 'status', 
      render: (val) => <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/30">PENDING</span> 
    },
    { 
      label: 'Action', 
      accessor: 'id', 
      render: (val, row) => (
        <button 
          onClick={() => { setSelectedNote(row); setIsModalOpen(true); }}
          className="btn-primary py-1.5 px-3 text-xs"
        >
          <Eye size={14} className="mr-1" /> Review
        </button>
      ) 
    }
  ];

  return (
    <Layout title="Notes Approvals">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between md:items-end">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="text-primary" /> Pending Notes
            </h2>
            <p className="text-slate-400 mt-1 text-sm">
              Review and approve student notes to allow flashcard generation.
            </p>
          </div>
        </div>

        <Card className="border-t-4 border-t-primary">
          <GenericTable 
            columns={columns} 
            data={notes} 
            loading={loading}
            emptyStateMessage="No pending notes for approval."
          />
        </Card>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} title="Review Student Note" size="lg">
        {selectedNote && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-2">{selectedNote.heading}</h3>
              <p className="text-sm text-slate-400 mb-4">
                Submitted by: <span className="text-slate-200">{selectedNote.student?.firstname} {selectedNote.student?.lastname}</span>
                <br/>
                Chapter: <span className="text-slate-200">{selectedNote.chapter}</span>
              </p>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/30 text-slate-300 min-h-[150px] whitespace-pre-wrap">
                {selectedNote.note}
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button 
                type="button" 
                onClick={() => handleReview('DECLINED')}
                disabled={isSubmitting}
                className="btn-danger py-2 flex items-center gap-2 px-5"
              >
                <XCircle size={18} /> Decline
              </button>
              <button 
                type="button" 
                onClick={() => handleReview('APPROVED')}
                disabled={isSubmitting}
                className="btn-primary py-2 flex items-center gap-2 px-5"
              >
                <CheckCircle size={18} /> Approve (10 Pts)
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};
