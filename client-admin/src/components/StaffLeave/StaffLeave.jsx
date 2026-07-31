import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Layout } from '../shared/Layout';
import { Card } from '../shared/Card';
import { GenericTable } from '../shared/GenericTable';
import { Modal } from '../shared/Modal';
import { FormInput } from '../shared/FormInput';
import { PlusCircle, CheckCircle, XCircle } from 'lucide-react';
import { useFetch } from '../shared/useFetch';
import { jwtDecode } from 'jwt-decode';

export const StaffLeave = () => {
  const token = localStorage.getItem('authToken');
  const userRole = token ? jwtDecode(token).user_type : '';
  
  const { data, loading, refetch } = useFetch('/leave');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    start_date: '', end_date: '', reason: ''
  });

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/leave', formData);
      toast.success('Leave request submitted!');
      setIsModalOpen(false);
      setFormData({ start_date: '', end_date: '', reason: '' });
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/leave/${id}/status`, { status });
      toast.success(`Leave request ${status.toLowerCase()}`);
      refetch();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const columns = [
    { label: 'Staff Name', accessor: 'staff', render: (val) => <span className="font-medium text-slate-200">{val?.user?.firstname} {val?.user?.lastname}</span> },
    { label: 'Start Date', accessor: 'start_date' },
    { label: 'End Date', accessor: 'end_date' },
    { label: 'Reason', accessor: 'reason' },
    { 
      label: 'Status', 
      accessor: 'status', 
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          val === 'APPROVED' ? 'bg-secondary/20 text-secondary' : 
          val === 'REJECTED' ? 'bg-danger/20 text-danger' : 'bg-amber-500/20 text-amber-500'
        }`}>{val}</span>
      ) 
    }
  ];

  if (userRole === 'ADMIN') {
    columns.push({
      label: 'Actions',
      accessor: 'id',
      render: (val, row) => row.status === 'PENDING' ? (
        <div className="flex gap-2">
          <button onClick={() => handleStatusUpdate(val, 'APPROVED')} className="text-secondary hover:text-emerald-400"><CheckCircle size={18} /></button>
          <button onClick={() => handleStatusUpdate(val, 'REJECTED')} className="text-danger hover:text-rose-400"><XCircle size={18} /></button>
        </div>
      ) : <span className="text-textMuted text-xs">Processed</span>
    });
  }

  return (
    <Layout title="Staff Leave Requests">
      <Card 
        title="Leave Requests" 
        action={userRole === 'STAFF' && (
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <PlusCircle size={18} /> Request Leave
          </button>
        )}
      >
        <GenericTable columns={columns} data={data} loading={loading} emptyStateMessage="No leave requests found." />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Request Leave">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Start Date" name="start_date" type="date" value={formData.start_date} onChange={handleFormChange} required />
            <FormInput label="End Date" name="end_date" type="date" value={formData.end_date} onChange={handleFormChange} required />
          </div>
          <div className="flex flex-col space-y-1.5 mb-4">
            <label className="text-sm font-medium text-slate-500">Reason *</label>
            <textarea 
              name="reason" 
              value={formData.reason} 
              onChange={handleFormChange} 
              required 
              className="input-field h-24 resize-none" 
              placeholder="Provide a reason for your leave..."
            ></textarea>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-textMuted">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">Submit Request</button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
