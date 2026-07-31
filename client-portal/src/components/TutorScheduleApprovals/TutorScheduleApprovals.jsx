import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Layout } from '../shared/Layout';
import { Card } from '../shared/Card';
import { GenericTable } from '../shared/GenericTable';
import { Modal } from '../shared/Modal';
import { FormSelect } from '../shared/FormSelect';
import { CheckCircle, XCircle } from 'lucide-react';
import { useFetch } from '../shared/useFetch';

export const TutorScheduleApprovals = () => {
  const { data, loading, refetch } = useFetch('/schedule-requests/tutor');

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [formData, setFormData] = useState({ preferred_day: '', preferred_timeslotid: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const days = [
    { label: 'Monday', value: 'monday' },
    { label: 'Tuesday', value: 'tuesday' },
    { label: 'Wednesday', value: 'wednesday' },
    { label: 'Thursday', value: 'thursday' },
    { label: 'Friday', value: 'friday' },
    { label: 'Saturday', value: 'saturday' },
    { label: 'Sunday', value: 'sunday' }
  ];
  
  // Since we don't have global timeslots context, we just offer 1-12 as timeslotids
  const timeslots = Array.from({length: 12}, (_, i) => ({ label: `Slot ${i+1}`, value: i+1 }));

  const handleApprove = async (id) => {
    try {
      await api.put(`/schedule-requests/tutor/${id}`, { action: 'APPROVE' });
      toast.success('Schedule approved and added to timetable!');
      refetch();
    } catch (err) {
      toast.error('Failed to approve schedule');
    }
  };

  const handleRejectPrompt = (id) => {
    setSelectedRequestId(id);
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/schedule-requests/tutor/${selectedRequestId}`, {
        action: 'REJECT',
        preferred_day: formData.preferred_day,
        preferred_timeslotid: Number(formData.preferred_timeslotid)
      });
      toast.success('Proposed new time sent to admin.');
      setIsRejectModalOpen(false);
      setFormData({ preferred_day: '', preferred_timeslotid: '' });
      refetch();
    } catch (err) {
      toast.error('Failed to propose new time');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { label: 'Subject', accessor: 'subjectTutor', render: (val) => <span className="text-secondary font-medium">{val?.subject?.name} - {val?.grade?.name}</span> },
    { label: 'Classroom', accessor: 'classroom', render: (val) => val?.name },
    { label: 'Proposed Day', accessor: 'day_of_week', render: (val) => <span className="capitalize">{val}</span> },
    { label: 'Proposed Slot', accessor: 'timeslotid', render: (val) => `Slot ${val}` },
    { 
      label: 'Status', 
      accessor: 'status', 
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          val === 'APPROVED' ? 'bg-secondary/20 text-secondary' : 
          val === 'PENDING_ADMIN' ? 'bg-amber-500/20 text-amber-500' :
          val === 'PENDING_TUTOR' ? 'bg-blue-500/20 text-blue-500' : 'bg-danger/20 text-danger'
        }`}>{val.replace(/_/g, ' ')}</span>
      ) 
    },
    {
      label: 'Actions',
      accessor: 'id',
      render: (val, row) => row.status === 'PENDING_TUTOR' ? (
        <div className="flex gap-2">
          <button onClick={() => handleApprove(val)} className="text-secondary hover:text-emerald-400" title="Approve & Schedule"><CheckCircle size={18} /></button>
          <button onClick={() => handleRejectPrompt(val)} className="text-danger hover:text-rose-400" title="Reject & Propose New"><XCircle size={18} /></button>
        </div>
      ) : <span className="text-textMuted text-xs">Processed</span>
    }
  ];

  return (
    <Layout title="Schedule Requests">
      <Card title="Pending Class Schedule Requests">
        <GenericTable columns={columns} data={data} loading={loading} emptyStateMessage="No incoming requests." />
      </Card>

      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Propose Alternative Time">
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <p className="text-sm text-textMuted mb-2">If you cannot accommodate the admin's proposed time, you can suggest an alternative below.</p>
          <FormSelect
            label="Preferred Day"
            name="preferred_day"
            value={formData.preferred_day}
            onChange={(e) => setFormData({...formData, preferred_day: e.target.value})}
            options={[{label: 'Select Day', value: ''}, ...days]}
            required
          />
          <FormSelect
            label="Preferred Time Slot"
            name="preferred_timeslotid"
            value={formData.preferred_timeslotid}
            onChange={(e) => setFormData({...formData, preferred_timeslotid: e.target.value})}
            options={[{label: 'Select Slot', value: ''}, ...timeslots]}
            required
          />
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setIsRejectModalOpen(false)} className="px-4 py-2 text-textMuted">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">Propose Time</button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
