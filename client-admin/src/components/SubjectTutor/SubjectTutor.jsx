import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../shared/Layout';
import { Card } from '../shared/Card';
import { GenericTable } from '../shared/GenericTable';
import { Modal } from '../shared/Modal';
import { FormSelect } from '../shared/FormSelect';
import { FormInput } from '../shared/FormInput';
import { PlusCircle, Trash2, Filter, Edit3, Search, Calendar } from 'lucide-react';
import { useFetch } from '../shared/useFetch';

export const SubjectTutor = () => {
  const navigate = useNavigate();
  
  // Filters (use IDs for backend filtering)
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('');
  const [selectedTutorFilter, setSelectedTutorFilter] = useState('');

  const { data, loading, error, pagination, refetch } = useFetch('/subject-tutors/all', {
    gradeid: selectedGradeFilter,
    subjectid: selectedSubjectFilter,
    tutorid: selectedTutorFilter
  });

  const fetchAllocations = refetch; 
  // Keep alias for compatibility with existing save/delete handlers


  const [gradesOptions, setGradesOptions] = useState([]);
  const [subjectsOptions, setSubjectsOptions] = useState([]);
  const [tutorsOptions, setTutorsOptions] = useState([]);

  const fetchDropdowns = useCallback(async () => {
    try {
      const [gradeRes, subjectRes, tutorRes] = await Promise.all([
        api.get('/grades'),
        api.get('/subjects/all'),
        api.get('/tutors/all')
      ]);
      setGradesOptions(gradeRes.data.map(g => ({ label: g.name, value: g.id })));
      setSubjectsOptions(subjectRes.data.data.map(s => ({ label: s.name, value: s.id })));
      setTutorsOptions(tutorRes.data.data.map(t => ({ label: `${t.firstname} ${t.lastname}`, value: t.id })));
    } catch (err) {
      console.error('Dropdown fetch failed', err);
    }
  }, []);

  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' or 'EDIT'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ id: '', grade: '', subject: '', tutor: '', fees: '' });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this allocation?')) {
      try {
        await api.delete(`/subject-tutors/${id}`);
        toast.success('Allocation deleted');
        fetchAllocations();
      } catch (err) {
        toast.error('Failed to delete allocation');
        console.error('Delete failed:', err);
      }
    }
  };

  const openCreateModal = () => {
    setModalMode('CREATE');
    setFormData({ id: '', grade: '', subject: '', tutor: '', fees: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode('EDIT');
    setFormData({ 
      id: item.id, 
      grade: item.gradeid, 
      subject: item.subjectid, 
      tutor: item.tutorid, 
      fees: item.fees 
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        gradeid: parseInt(formData.grade),
        subjectid: parseInt(formData.subject),
        tutorid: parseInt(formData.tutor),
        fees: parseFloat(formData.fees) || 0
      };

      if (modalMode === 'CREATE') {
        await api.post('/subject-tutors', payload);
      } else {
        await api.put(`/subject-tutors/${formData.id}`, payload);
      }

      setIsModalOpen(false);
      setFormData({ id: '', grade: '', subject: '', tutor: '', fees: '' });
      toast.success(`Allocation ${modalMode === 'CREATE' ? 'created' : 'updated'}`);
      fetchAllocations();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || `Failed to ${modalMode === 'CREATE' ? 'create' : 'update'} mapping`;
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filterGradeOptions = [{ label: 'All Grades', value: '' }, ...gradesOptions];
  const filterSubjectOptions = [{ label: 'All Subjects', value: '' }, ...subjectsOptions];
  const filterTutorOptions = [{ label: 'All Tutors', value: '' }, ...tutorsOptions];

  const columns = [
    { label: 'ID', accessor: 'id', render: (val) => <span className="text-textMuted">#{val}</span> },
    { label: 'Grade', accessor: 'grade', render: (val) => <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">{val}</span> },
    { label: 'Subject', accessor: 'subject', render: (val) => <span className="font-medium text-slate-200">{val}</span> },
    { label: 'Tutor', accessor: 'tutor' },
    { label: 'Fees (LKR)', accessor: 'fees', render: (val) => <span className="text-emerald-400 font-medium">{val}</span> },
    { 
      label: 'Actions', 
      accessor: 'id',
      render: (id, row) => (
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/timetable')} className="text-textMuted hover:text-emerald-400 transition-colors" title="View Schedule">
            <Calendar size={18} />
          </button>
          <button onClick={() => openEditModal(row)} className="text-textMuted hover:text-primary transition-colors">
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
    <button onClick={openCreateModal} className="btn-primary">
      <PlusCircle size={18} /> Allocate Subject
    </button>
  );

  return (
    <Layout title="Subject Allocation">
        
        {/* Filters Section */}
        <div className="flex flex-col xl:flex-row gap-4 mb-6 p-4 rounded-xl glass-card backdrop-blur-xl border border-slate-700/50 items-center">
          <div className="flex items-center gap-2 text-textMuted mr-2 shrink-0">
            <Filter size={18} /> <span className="font-medium text-sm uppercase tracking-wider">Filters</span>
          </div>
          <div className="w-full xl:max-w-xs">
            <FormSelect 
              value={selectedGradeFilter} 
              onChange={(e) => setSelectedGradeFilter(e.target.value)}
              options={filterGradeOptions}
              className="!mb-0"
            />
          </div>
          <div className="w-full xl:max-w-xs">
            <FormSelect 
              value={selectedSubjectFilter} 
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              options={filterSubjectOptions}
              className="!mb-0"
            />
          </div>
          <div className="w-full xl:max-w-xs">
            <FormSelect 
              value={selectedTutorFilter} 
              onChange={(e) => setSelectedTutorFilter(e.target.value)}
              options={filterTutorOptions}
              className="!mb-0"
            />
          </div>
        </div>

        {error && <div className="bg-danger/20 border border-danger/50 text-danger px-4 py-3 rounded-xl mb-6">{error}</div>}
        
        <Card title="Mapping Directory" action={TableActions}>
          <GenericTable 
            columns={columns} 
            data={data} 
            loading={loading} 
            emptyStateMessage="No subject allocations found matching the filters."
            pagination={pagination}
          />
        </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'CREATE' ? "Create Subject-Tutor Mapping" : "Edit Allocation"}>
        <form onSubmit={handleModalSubmit}>
          <div className="space-y-4">
            <FormSelect label="Grade" name="grade" value={formData.grade} onChange={handleFormChange} options={gradesOptions} required />
            <FormSelect label="Subject" name="subject" value={formData.subject} onChange={handleFormChange} options={subjectsOptions} required />
            <FormSelect label="Tutor" name="tutor" value={formData.tutor} onChange={handleFormChange} options={tutorsOptions} required />
            <FormInput label="Monthly Fees (LKR)" name="fees" type="number" step="0.01" value={formData.fees} onChange={handleFormChange} placeholder="e.g. 5000" required />
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-textMuted hover:bg-slate-800 transition-colors font-medium">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : (modalMode === 'CREATE' ? 'Create Mapping' : 'Save Changes')}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
