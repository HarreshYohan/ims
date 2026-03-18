import React, { useState, useMemo } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../shared/Layout';
import { useFetch } from '../shared/useFetch';
import { GenericTable } from '../shared/GenericTable';
import { Card } from '../shared/Card';
import { Modal } from '../shared/Modal';
import { FormInput } from '../shared/FormInput';
import { FormSelect } from '../shared/FormSelect';
import { UserPlus, Edit3, Trash2 } from 'lucide-react';

export const Tutor = () => {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, loading, error, pagination, refetch } = useFetch('/tutors/all', {
    search: debouncedSearch
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '', firstname: '', lastname: '', username: '', email: '', password: '', contact: ''
  });

  const handleEdit = (id) => navigate(`/edit-tutor/${id}`);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this tutor?")) {
      try {
        await api.delete(`/tutors/${id}`);
        refetch();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/tutors', formData);
      toast.success('Tutor created successfully!');
      setIsModalOpen(false);
      setFormData({ title: '', firstname: '', lastname: '', username: '', email: '', password: '', contact: '' });
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create tutor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = useMemo(() => {
    const requiredFields = [
      formData.title, formData.firstname, formData.lastname, 
      formData.username, formData.email, formData.password, formData.contact
    ];
    const isComplete = requiredFields.every(field => field && field.toString().trim() !== '');
    const isContactValid = formData.contact && formData.contact.toString().length === 10;
    const isPasswordValid = formData.password && formData.password.length >= 8;

    return isComplete && isContactValid && isPasswordValid;
  }, [formData]);

  const columns = [
    { label: 'ID', accessor: 'id', render: (val) => <span className="text-textMuted">#{val}</span> },
    { label: 'Title', accessor: 'title', render: (val) => <span className="text-secondary font-medium">{val}</span> },
    { label: 'Name', accessor: 'firstname', render: (_, row) => <span className="font-medium text-slate-200">{row.firstname} {row.lastname}</span> },
    { label: 'Contact', accessor: 'contact' },
    { label: 'Email', accessor: 'email', render: (_, row) => <span className="text-textMuted text-sm">{row.user?.email || 'N/A'}</span> },
    { 
      label: 'Actions', 
      accessor: 'id',
      render: (id) => (
        <div className="flex items-center gap-3">
          <button onClick={() => handleEdit(id)} className="text-textMuted hover:text-primary transition-colors">
            <Edit3 size={18} />
          </button>
          <button onClick={() => handleDelete(id)} className="text-textMuted hover:text-danger transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  const TableActions = (
    <div className="flex flex-col md:flex-row items-center gap-4 w-full">
      <div className="flex flex-1 items-center gap-3 w-full">
        <div className="w-full md:w-64">
          <FormInput 
            placeholder="Search tutors..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="!mb-0"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <UserPlus size={18} /> Add Tutor
        </button>
      </div>
    </div>
  );

  return (
    <Layout title="Tutors">
        {error && <div className="bg-danger/20 border border-danger/50 text-danger px-4 py-3 rounded-xl mb-6">{error}</div>}
        
        <Card title="Tutor Directory" action={TableActions}>
          <GenericTable 
            columns={columns} 
            data={data} 
            loading={loading} 
            pagination={pagination}
          />
        </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Tutor">
        <form onSubmit={handleCreateSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect 
              label="Title" 
              name="title" 
              value={formData.title} 
              onChange={handleFormChange} 
              required 
              autoFocus
              options={[
                { label: 'Mr', value: 'Mr' },
                { label: 'Mrs', value: 'Mrs' },
                { label: 'Ms', value: 'Ms' },
                { label: 'Miss', value: 'Miss' },
                { label: 'Dr', value: 'Dr' },
                { label: 'Rev', value: 'Rev' }
              ]} 
            />
            <FormInput label="Contact (10 Digits)" name="contact" value={formData.contact} onChange={handleFormChange} required maxLength={10} />
            <FormInput label="First Name" name="firstname" value={formData.firstname} onChange={handleFormChange} required />
            <FormInput label="Last Name" name="lastname" value={formData.lastname} onChange={handleFormChange} required />
            <FormInput label="Username" name="username" value={formData.username} onChange={handleFormChange} required />
            <FormInput label="Email" name="email" type="email" value={formData.email} onChange={handleFormChange} required />
            <div className="md:col-span-2">
              <FormInput label="Password" name="password" type="password" value={formData.password} onChange={handleFormChange} required minLength={8} />
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-textMuted hover:bg-slate-800 transition-colors font-medium">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !isFormValid} 
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Tutor'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
