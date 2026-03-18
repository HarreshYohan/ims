import React, { useState, useMemo } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Layout } from '../shared/Layout';
import { useFetch } from '../shared/useFetch';
import { GenericTable } from '../shared/GenericTable';
import { Card } from '../shared/Card';
import { Modal } from '../shared/Modal';
import { FormInput } from '../shared/FormInput';
import { PlusCircle, Edit3, Trash2 } from 'lucide-react';

export const Syllabus = () => {
  const { data, loading, error, pagination, refetch } = useFetch('/syllabus');
  
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
    if (window.confirm("Are you sure you want to delete this syllabus?")) {
      try {
        await api.delete(`/syllabus/${id}`);
        toast.success('Syllabus deleted successfully');
        refetch();
      } catch (err) {
        console.error('Delete failed:', err);
        toast.error('Failed to delete syllabus. It might be in use.');
      }
    }
  };

  const isFormValid = useMemo(() => {
    return formData.name && formData.name.trim() !== '';
  }, [formData]);

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modalMode === 'CREATE') {
        await api.post('/syllabus', { name: formData.name });
      } else {
        await api.put(`/syllabus/${formData.id}`, { name: formData.name });
      }
      setIsModalOpen(false);
      toast.success(`Syllabus ${modalMode === 'CREATE' ? 'created' : 'updated'} successfully`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${modalMode === 'CREATE' ? 'create' : 'update'} syllabus`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { label: 'ID', accessor: 'id', render: (val) => <span className="text-textMuted">#{val}</span> },
    { label: 'Syllabus Name', accessor: 'name', render: (val) => <span className="font-medium text-slate-200">{val}</span> },
    { 
      label: 'Actions', 
      accessor: 'id',
      render: (id, row) => (
        <div className="flex items-center gap-3">
          <button onClick={() => openEditModal(row)} className="text-textMuted hover:text-primary transition-colors" title="Edit Syllabus">
            <Edit3 size={18} />
          </button>
          <button onClick={() => handleDelete(id)} className="text-textMuted hover:text-danger transition-colors" title="Delete Syllabus">
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  const TableActions = (
    <div className="flex items-center gap-2">
      <button onClick={openCreateModal} className="btn-primary">
        <PlusCircle size={18} /> Add Syllabus
      </button>
    </div>
  );

  return (
    <Layout title="Syllabus Management">
        {error && <div className="bg-danger/20 border border-danger/50 text-danger px-4 py-3 rounded-xl mb-6">{error}</div>}
        
        <Card title="Syllabuses" action={TableActions}>
          <GenericTable 
            columns={columns} 
            data={data} 
            loading={loading}
            emptyStateMessage="No syllabuses found. Create one to get started."
          />
        </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'CREATE' ? "Add New Syllabus" : "Edit Syllabus"}>
        <form onSubmit={handleModalSubmit}>
          <div className="space-y-4">
            <FormInput 
              label="Syllabus Name" 
              name="name" 
              value={formData.name} 
              onChange={handleFormChange} 
              placeholder="e.g. Local, Cambridge, Edexcel"
              autoFocus
              required 
            />
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-textMuted hover:bg-slate-800 transition-colors font-medium">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || !isFormValid} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
              {isSubmitting ? 'Saving...' : (modalMode === 'CREATE' ? 'Create Syllabus' : 'Save Changes')}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
