import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Layout } from '../shared/Layout';
import { useFetch } from '../shared/useFetch';
import { GenericTable } from '../shared/GenericTable';
import { Card } from '../shared/Card';
import { Modal } from '../shared/Modal';
import { FormInput } from '../shared/FormInput';
import { FormSelect } from '../shared/FormSelect';
import { PlusCircle, Edit3, Trash2 } from 'lucide-react';

export const Grade = () => {
  const { data, loading, error, pagination, refetch } = useFetch('/grades');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' or 'EDIT'
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ id: '', name: '' });

  const openCreateModal = () => {
    setModalMode('CREATE');
    setFormData({ id: '', name: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode('EDIT');
    setFormData({ id: item.id, name: item.name });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this grade?")) {
      try {
        await api.delete(`/grades/${id}`);
        toast.success('Grade deleted');
        refetch();
      } catch (err) {
        console.error('Delete failed:', err);
        toast.error('Failed to delete grade. It might be in use.');
      }
    }
  };

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modalMode === 'CREATE') {
        await api.post('/grades', { name: formData.name });
      } else {
        await api.put(`/grades/${formData.id}`, { name: formData.name });
      }
      setIsModalOpen(false);
      toast.success(`Grade ${modalMode === 'CREATE' ? 'created' : 'updated'} successfully`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${modalMode === 'CREATE' ? 'create' : 'update'} grade`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { label: 'ID', accessor: 'id', render: (val) => <span className="text-textMuted">#{val}</span> },
    { label: 'Grade Name', accessor: 'name', render: (val) => <span className="font-medium text-white">{val}</span> },
    { 
      label: 'Actions', 
      accessor: 'id',
      render: (id, row) => (
        <div className="flex items-center gap-3">
          <button onClick={() => openEditModal(row)} className="text-textMuted hover:text-primary transition-colors" title="Edit Grade">
            <Edit3 size={18} />
          </button>
          <button onClick={() => handleDelete(id)} className="text-textMuted hover:text-danger transition-colors" title="Delete Grade">
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  const TableActions = (
    <button onClick={openCreateModal} className="btn-primary">
      <PlusCircle size={18} /> Add Grade
    </button>
  );

  return (
    <Layout title="Grade Management">
        {error && <div className="bg-danger/20 border border-danger/50 text-danger px-4 py-3 rounded-xl mb-6">{error}</div>}
        
        <Card title="Grades" action={TableActions}>
          <GenericTable 
            columns={columns} 
            data={data} 
            loading={loading}
            emptyStateMessage="No grades found. Create one to get started."
          />
        </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'CREATE' ? "Add New Grade" : "Edit Grade"}>
        <form onSubmit={handleModalSubmit}>
          <div className="space-y-4">
            <FormSelect 
              label="Grade Name" 
              name="name" 
              value={formData.name} 
              onChange={handleFormChange} 
              options={[
                { label: 'Select Grade', value: '' },
                { label: 'Grade 1', value: 'Grade 1' },
                { label: 'Grade 2', value: 'Grade 2' },
                { label: 'Grade 3', value: 'Grade 3' },
                { label: 'Grade 4', value: 'Grade 4' },
                { label: 'Grade 5', value: 'Grade 5' },
                { label: 'Grade 6', value: 'Grade 6' },
                { label: 'Grade 7', value: 'Grade 7' },
                { label: 'Grade 8', value: 'Grade 8' },
                { label: 'Grade 9', value: 'Grade 9' },
                { label: 'Grade 10', value: 'Grade 10' },
                { label: 'Grade 11', value: 'Grade 11' },
                { label: 'Grade 12', value: 'Grade 12' },
                { label: 'Grade 13', value: 'Grade 13' },
                { label: 'After O/L', value: 'After O/L' },
                { label: 'After A/L', value: 'After A/L' },
                { label: 'Pre School', value: 'Pre School' },
              ]}
              required 
            />
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-textMuted hover:bg-slate-800 transition-colors font-medium">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : (modalMode === 'CREATE' ? 'Create Grade' : 'Save Changes')}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
