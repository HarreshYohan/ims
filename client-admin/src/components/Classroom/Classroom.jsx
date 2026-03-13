import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Layout } from '../shared/Layout';
import { useFetch } from '../shared/useFetch';
import { GenericTable } from '../shared/GenericTable';
import { Card } from '../shared/Card';
import { Modal } from '../shared/Modal';
import { FormInput } from '../shared/FormInput';
import { PlusCircle, Edit3, Trash2 } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

export const Classroom = () => {
  const [userType, setUserType] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) { try { setUserType(jwtDecode(token).user_type); } catch(e){} }
  }, []);
  const canEdit = userType === 'ADMIN' || userType === 'STAFF';
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, loading, error, pagination, refetch } = useFetch('/classrooms/all', {
    search: debouncedSearch
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' or 'EDIT'
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ id: '', name: '', capacity: '' });

  const openCreateModal = () => {
    setModalMode('CREATE');
    setFormData({ id: '', name: '', capacity: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode('EDIT');
    setFormData({ id: item.id, name: item.name, capacity: item.capacity });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this classroom?")) {
      try {
        await api.delete(`/classrooms/${id}`);
        toast.success('Classroom deleted');
        refetch();
      } catch (err) {
        toast.error('Failed to delete classroom');
        console.error('Delete failed:', err);
      }
    }
  };

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modalMode === 'CREATE') {
        await api.post('/classrooms', { name: formData.name, capacity: formData.capacity });
      } else {
        await api.put(`/classrooms/${formData.id}`, { name: formData.name, capacity: formData.capacity });
      }
      setIsModalOpen(false);
      toast.success(`Classroom ${modalMode === 'CREATE' ? 'created' : 'updated'}`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${modalMode === 'CREATE' ? 'create' : 'update'} classroom`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { label: 'ID', accessor: 'id', render: (val) => <span className="text-textMuted">#{val}</span> },
    { label: 'Name', accessor: 'name', render: (val) => <span className="font-medium text-white">{val}</span> },
    { label: 'Capacity', accessor: 'capacity', render: (val) => <span className="text-secondary">{val} students</span> },
    ...(canEdit ? [{
      label: 'Actions', 
      accessor: 'id',
      render: (id, row) => (
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/timetable', { state: { classroomid: id } })} className="text-textMuted hover:text-emerald-400 transition-colors" title="View Timetable">
            <PlusCircle size={18} />
          </button>
          <button onClick={() => openEditModal(row)} className="text-textMuted hover:text-primary transition-colors">
            <Edit3 size={18} />
          </button>
          <button onClick={() => handleDelete(id)} className="text-textMuted hover:text-danger transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      )
    }] : [])
  ];

  const TableActions = (
    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
      <div className="flex items-center gap-2 w-full md:w-64">
        <FormInput 
          placeholder="Search rooms..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          className="!mb-0"
        />
      </div>
      {canEdit && (
        <button onClick={openCreateModal} className="btn-primary ml-auto">
          <PlusCircle size={18} /> Add Classroom
        </button>
      )}
    </div>
  );

  return (
    <Layout title="Classroom Management">
        {error && <div className="bg-danger/20 border border-danger/50 text-danger px-4 py-3 rounded-xl mb-6">{error}</div>}
        
        <Card title="Classrooms" action={TableActions}>
          <GenericTable 
            columns={columns} 
            data={data} 
            loading={loading} 
            pagination={pagination}
          />
        </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'CREATE' ? "Add New Classroom" : "Edit Classroom"}>
        <form onSubmit={handleModalSubmit}>
          <div className="space-y-4">
            <FormInput label="Classroom Name" name="name" value={formData.name} onChange={handleFormChange} placeholder="e.g. Hall A, Chemistry Lab" required />
            <FormInput label="Capacity" name="capacity" type="number" value={formData.capacity} onChange={handleFormChange} placeholder="e.g. 40" required />
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-textMuted hover:bg-slate-800 transition-colors font-medium">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : (modalMode === 'CREATE' ? 'Create Classroom' : 'Save Changes')}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
