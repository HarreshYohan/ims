import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
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
import { jwtDecode } from 'jwt-decode';

export const Student = () => {
  const navigate = useNavigate();
  const localToken = localStorage.getItem('authToken');
  
  // Filtering state
  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [syllabusFilter, setSyllabusFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [uid, setUid] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (localToken) {
      try {
        const decoded = jwtDecode(localToken);
        setUid(decoded.user_id);
        setUserRole(decoded.user_type);
      } catch (e) { console.error(e); }
    }
  }, [localToken]);

  const { data, loading, error, pagination, refetch } = useFetch('/students/all', { 
    search: debouncedSearch,
    grade: gradeFilter,
    syllabusid: syllabusFilter,
    tutorid: userRole === 'TUTOR' ? uid : undefined
  });
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [grades, setGrades] = useState([]);
  const [syllabuses, setSyllabuses] = useState([]);
  const [generatedCreds, setGeneratedCreds] = useState(null);
  const [formData, setFormData] = useState({
    email: '', firstname: '', lastname: '', grade: '', contact: '', username: '', password: '', syllabusid: ''
  });

  // Fetch Grades for Dropdown
  useEffect(() => {
    const fetchGradesAndSyllabuses = async () => {
      try {
        const [gradesRes, syllabusesRes] = await Promise.all([
          api.get('/grades'),
          api.get('/syllabus')
        ]);
        setGrades(gradesRes.data.map(g => ({ label: g.name, value: g.name })));
        setSyllabuses(syllabusesRes.data.map(s => ({ label: s.name, value: s.id })));
      } catch (err) {
        console.error('Failed to fetch grades or syllabuses:', err);
      }
    };
    fetchGradesAndSyllabuses();
  }, []);

  const handleEdit = (id) => navigate(`/edit-student/${id}`);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await api.delete(`/students/${id}`);
        toast.success('Student deleted');
        refetch(); // Reload table after delete
      } catch (err) {
        toast.error('Delete failed');
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
      setFormData({ email: '', firstname: '', lastname: '', grade: '', contact: '', username: '', password: '', syllabusid: '' });
      toast.success('Student created successfully!');
      refetch(); // Refresh the table
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create student';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = useMemo(() => {
    const requiredFields = [
      formData.firstname, formData.lastname, formData.email, 
      formData.contact, formData.grade, formData.syllabusid
    ];
    const isComplete = requiredFields.every(field => field && field.toString().trim() !== '');
    const isContactValid = formData.contact && formData.contact.toString().length === 10;
    const isAuthValid = (formData.username || formData.password) 
      ? (formData.username && formData.password && formData.password.length >= 8)
      : true;

    return isComplete && isContactValid && isAuthValid;
  }, [formData]);

  const columns = [
    { label: 'ID', accessor: 'id', render: (val) => <span className="text-textMuted">#{val}</span> },
    { label: 'Name', accessor: 'firstname', render: (_, row) => <span className="font-medium text-slate-200">{row.firstname} {row.lastname}</span> },
    { label: 'Grade', accessor: 'grade', render: (val) => <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">{val}</span> },
    { label: 'Syllabus', accessor: 'syllabus', render: (val) => <span className="text-slate-400 text-xs">{val?.name || 'N/A'}</span> },
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
            options={[{ label: 'All Grades', value: '' }, ...grades.map(g => ({ label: g.label, value: g.label }))] }
            className="!mb-0"
          />
        </div>
        <div className="w-full md:w-48">
          <FormSelect 
            value={syllabusFilter} 
            onChange={(e) => setSyllabusFilter(e.target.value)}
            options={[{ label: 'All Syllabuses', value: '' }, ...syllabuses.map(s => ({ label: s.label, value: s.value }))] }
            className="!mb-0"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
        <button onClick={handleDownload} className="text-sm flex items-center gap-2 text-textMuted hover:text-slate-200 transition-colors px-3 py-2 rounded-lg border border-slate-700/50 hover:bg-slate-800">
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
              <h3 className="text-xl font-bold text-slate-200 mb-2">Student Created Successfully!</h3>
              <p className="text-textMuted text-sm">An email has been sent to the student. Here are the login details for your reference:</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <span className="text-xs text-textMuted uppercase block mb-1">Username</span>
                <span className="text-lg font-mono text-slate-200 select-all">{generatedCreds.username}</span>
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
              <FormInput label="Contact (10 Digits)" name="contact" value={formData.contact} onChange={handleFormChange} required maxLength={10} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                <FormSelect 
                  label="Grade" 
                  name="grade" 
                  value={formData.grade} 
                  onChange={handleFormChange} 
                  options={grades}
                  required 
                />
                <FormSelect 
                  label="Syllabus" 
                  name="syllabusid" 
                  value={formData.syllabusid} 
                  onChange={handleFormChange} 
                  options={[{ label: 'Select Syllabus...', value: '' }, ...syllabuses]}
                  required 
                />
              </div>
              <div className="md:col-span-2 pt-2 border-t border-slate-700/50 mt-2">
                <p className="text-xs text-textMuted mb-4 italic">Optional: Set manual credentials (leave blank to auto-generate)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput label="Custom Username" name="username" value={formData.username} onChange={handleFormChange} placeholder="e.g. johndoe" />
                  <FormInput label="Custom Password" name="password" type="password" value={formData.password} onChange={handleFormChange} placeholder="Min 8 characters" />
                </div>
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
                {isSubmitting ? 'Creating...' : 'Create Student'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </Layout>
  );
};
