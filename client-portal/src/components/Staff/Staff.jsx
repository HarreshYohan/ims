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
import { UserPlus, Edit3, Trash2, Briefcase } from 'lucide-react';

export const Staff = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, loading, error, pagination, refetch } = useFetch('/staff/all', {
    search: debouncedSearch,
    position: positionFilter
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' or 'EDIT'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: '', title: '', firstname: '', lastname: '', username: '', email: '', password: '', contact: '', position: '', salary: ''
  });

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await api.delete(`/staff/${id}`);
        toast.success('Staff member deleted');
        refetch();
      } catch (err) {
        toast.error(err.response?.data?.message || "Delete failed");
      }
    }
  };

  const openCreateModal = () => {
    setModalMode('CREATE');
    setFormData({ id: '', title: '', firstname: '', lastname: '', username: '', email: '', password: '', contact: '', position: '', salary: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode('EDIT');
    setFormData({ 
      id: item.id, 
      title: item.title, 
      firstname: item.firstname, 
      lastname: item.lastname, 
      username: item.username, 
      email: item.email, 
      password: '', // Don't show password
      contact: item.contact, 
      position: item.position, 
      salary: item.salary 
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modalMode === 'CREATE') {
        await api.post('/staff', formData);
      } else {
        await api.put(`/staff/${formData.id}`, formData);
      }
      setIsModalOpen(false);
      toast.success(`Staff ${modalMode === 'CREATE' ? 'created' : 'updated'} successfully`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${modalMode === 'CREATE' ? 'create' : 'update'} staff`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { label: 'ID', accessor: 'user_id', render: (val) => <span className="text-textMuted">#{val}</span> },
    { label: 'Title', accessor: 'title', render: (val) => <span className="text-secondary font-medium">{val}</span> },
    { label: 'Name', accessor: 'firstname', render: (_, row) => <span className="font-medium text-white">{row.firstname} {row.lastname}</span> },
    { label: 'Position', accessor: 'position', render: (val) => (
      <span className="flex items-center gap-2">
        <Briefcase size={14} className="text-emerald-400" />
        {val}
      </span>
    )},
    { label: 'Contact', accessor: 'contact' },
    { 
      label: 'Actions', 
      accessor: 'user_id',
      render: (id, row) => (
        <div className="flex items-center gap-3">
          <button onClick={() => openEditModal(row)} className="text-textMuted hover:text-primary transition-colors font-medium">
            <Edit3 size={18} />
          </button>
          <button onClick={() => handleDelete(id)} className="text-textMuted hover:text-danger transition-colors font-medium">
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  const TableActions = (
    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
      <div className="flex items-center gap-2 w-full md:w-64">
        <FormInput 
          placeholder="Search staff..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          className="!mb-0"
        />
      </div>
      <div className="w-full md:w-48">
        <FormSelect 
          value={positionFilter} 
          onChange={(e) => setPositionFilter(e.target.value)}
          options={[
            { label: 'All Positions', value: '' },
            { label: 'Manager', value: 'Manager' },
            { label: 'Coordinator', value: 'Coordinator' },
            { label: 'Clerk', value: 'Clerk' },
            { label: 'Accountant', value: 'Accountant' },
            { label: 'Receptionist', value: 'Receptionist' }
          ]}
          className="!mb-0"
        />
      </div>
      <button onClick={openCreateModal} className="btn-primary ml-auto">
        <UserPlus size={18} /> Add Staff
      </button>
    </div>
  );

  return (
    <Layout title="Staff Management">
        {error && <div className="bg-danger/20 border border-danger/50 text-danger px-4 py-3 rounded-xl mb-6">{error}</div>}
        
        <Card title="Staff Directory" action={TableActions}>
          <GenericTable 
            columns={columns} 
            data={data} 
            loading={loading} 
            pagination={pagination}
          />
        </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'CREATE' ? "Add New Staff" : "Edit Staff"}>
        <form onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect 
              label="Title" 
              name="title" 
              value={formData.title} 
              onChange={handleFormChange} 
              required 
              options={[
                { label: 'Select Title', value: '' },
                { label: 'Mr', value: 'Mr' },
                { label: 'Mrs', value: 'Mrs' },
                { label: 'Ms', value: 'Ms' },
                { label: 'Miss', value: 'Miss' },
                { label: 'Dr', value: 'Dr' },
                { label: 'Rev', value: 'Rev' }
              ]} 
            />
            <FormInput label="Contact" name="contact" value={formData.contact} onChange={handleFormChange} required />
            <FormInput label="First Name" name="firstname" value={formData.firstname} onChange={handleFormChange} required />
            <FormInput label="Last Name" name="lastname" value={formData.lastname} onChange={handleFormChange} required />
            <FormInput label="Username" name="username" value={formData.username} onChange={handleFormChange} required />
            <FormInput label="Email" name="email" type="email" value={formData.email} onChange={handleFormChange} required />
            <FormInput label="Position" name="position" value={formData.position} onChange={handleFormChange} placeholder="e.g. Admin, Janitor" required />
            <FormInput label="Salary" name="salary" type="number" value={formData.salary} onChange={handleFormChange} required />
            <div className="md:col-span-2">
              <FormInput 
                label={modalMode === 'EDIT' ? "New Password (leave blank to keep current)" : "Password"} 
                name="password" 
                type="password" 
                value={formData.password} 
                onChange={handleFormChange} 
                required={modalMode === 'CREATE'} 
                minLength={8} 
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-textMuted hover:bg-slate-800 transition-colors font-medium">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : (modalMode === 'CREATE' ? 'Create Staff' : 'Save Changes')}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
