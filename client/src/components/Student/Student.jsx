import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../shared/Layout';
import { format } from 'date-fns';
import { useFetch } from '../shared/useFetch';
import { GenericTable } from '../shared/GenericTable';
import { Card } from '../shared/Card';
import { Modal } from '../shared/Modal';
import { FormInput } from '../shared/FormInput';
import { FormSelect } from '../shared/FormSelect';
import { UserPlus, Download, Edit3, Trash2 } from 'lucide-react';

export const Student = () => {
  const navigate = useNavigate();
  const localToken = localStorage.getItem('authToken');
  
  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, loading, error, pagination, refetch } = useFetch('/students/all', { 
    search: debouncedSearch,
    grade: gradeFilter 
  });
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [grades, setGrades] = useState([]);
  const [generatedCreds, setGeneratedCreds] = useState(null);
  const [formData, setFormData] = useState({
    email: '', firstname: '', lastname: '', grade: '', contact: ''
  });

  // Fetch Grades for Dropdown
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await api.get('/grades');
        setGrades(response.data.map(g => ({ label: g.name, value: g.id })));
      } catch (err) {
        console.error('Failed to fetch grades:', err);
      }
    };
    fetchGrades();
  }, []);

  const handleEdit = (id) => navigate(`/edit-student/${id}`);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await api.delete(`/students/${id}`);
        refetch(); // Reload table after delete
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get('/students/download/all', {
        headers: { Authorization: `Bearer ${localToken}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `students_${format(new Date(), 'MM-dd-yyyy')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post('/students', formData);
      setGeneratedCreds({
        username: response.data.generatedUsername,
        password: response.data.generatedPassword
      });
      setFormData({ email: '', firstname: '', lastname: '', grade: '', contact: '' });
      refetch(); // Refresh the table
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { label: 'ID', accessor: 'id', render: (val) => <span className="text-textMuted">#{val}</span> },
    { label: 'Name', accessor: 'firstname', render: (_, row) => <span className="font-medium text-white">{row.firstname} {row.lastname}</span> },
    { label: 'Grade', accessor: 'grade', render: (val) => <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">{val}</span> },
    { label: 'Contact', accessor: 'contact' },
    { label: 'Email', accessor: 'email', render: (val) => <span className="text-textMuted text-sm">{val}</span> },
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
    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
      <div className="flex items-center gap-2 w-full md:w-64">
        <FormInput 
          placeholder="Search students..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          className="!mb-0"
        />
      </div>
      <div className="w-full md:w-48">
        <FormSelect 
          value={gradeFilter} 
          onChange={(e) => setGradeFilter(e.target.value)}
          options={[{ label: 'All Grades', value: '' }, ...grades]}
          className="!mb-0"
        />
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <button onClick={handleDownload} className="text-sm flex items-center gap-2 text-textMuted hover:text-white transition-colors">
          <Download size={16} /> Export CSV
        </button>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <UserPlus size={18} /> Add Student
        </button>
      </div>
    </div>
  );
  
  return (
    <Layout title="Student Management">
        {error && <div className="bg-danger/20 border border-danger/50 text-danger px-4 py-3 rounded-xl mb-6">{error}</div>}
        
        <Card title="Student Directory" action={TableActions}>
          <GenericTable 
            columns={columns} 
            data={data} 
            loading={loading} 
            pagination={pagination}
          />
        </Card>


      {/* Unified Create Student Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setGeneratedCreds(null); }} title="Add New Student">
        {generatedCreds ? (
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                <UserPlus size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Student Created Successfully!</h3>
              <p className="text-textMuted text-sm">An email has been sent to the student. Here are the login details for your reference:</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <span className="text-xs text-textMuted uppercase block mb-1">Username</span>
                <span className="text-lg font-mono text-white select-all">{generatedCreds.username}</span>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <span className="text-xs text-textMuted uppercase block mb-1">Password</span>
                <span className="text-lg font-mono text-emerald-400 select-all">{generatedCreds.password}</span>
              </div>
            </div>

            <button 
              onClick={() => { setIsModalOpen(false); setGeneratedCreds(null); }}
              className="w-full btn-primary py-4 !rounded-xl text-lg mt-4"
            >
              Close & Continue
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreateSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="First Name" name="firstname" value={formData.firstname} onChange={handleFormChange} required />
              <FormInput label="Last Name" name="lastname" value={formData.lastname} onChange={handleFormChange} required />
              <FormInput label="Email" name="email" type="email" value={formData.email} onChange={handleFormChange} required />
              <FormInput label="Contact" name="contact" value={formData.contact} onChange={handleFormChange} required />
              <div className="md:col-span-2">
                <FormSelect 
                  label="Grade" 
                  name="grade" 
                  value={formData.grade} 
                  onChange={handleFormChange} 
                  options={grades}
                  required 
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-textMuted hover:bg-slate-800 transition-colors font-medium">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Creating...' : 'Create Student'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </Layout>
  );
};
