import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../Header/Header';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import { Card } from '../shared/Card';
import { GenericTable } from '../shared/GenericTable';
import { FormInput } from '../shared/FormInput';
import { FormSelect } from '../shared/FormSelect';
import { Trash2, Save, Plus } from 'lucide-react';

export const EditTutor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tutorData, setTutorData] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjectsByGrade, setSubjectsByGrade] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjectFees, setSubjectFees] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tutorRes, subjectMapRes, gradesRes] = await Promise.all([
        api.get(`/tutors/${id}`),
        api.get(`/tutors/subject-mapping/${id}`),
        api.get(`/tutors/grades/all`),
      ]);

      setTutorData(tutorRes.data);
      setSubjects(subjectMapRes.data.subjects);
      setGrades(gradesRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e) => setTutorData({ ...tutorData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put(`/tutors/${id}`, tutorData);
      navigate('/tutor');
    } catch (err) {
      console.error('Error saving tutor:', err);
      alert('Failed to update tutor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGradeChange = async (gradeid) => {
    setSelectedGrade(gradeid);
    setSelectedSubject('');
    if (!gradeid) {
      setSubjectsByGrade([]);
      return;
    }
    try {
      const res = await api.get(`/subjects/all`);
      setSubjectsByGrade(res.data.data);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const handleAddSubject = async () => {
    if (!selectedGrade || !selectedSubject || !subjectFees) {
      alert('Please select grade, subject and enter fees');
      return;
    }
    try {
      await api.post(`/tutors/add-subject`, {
        tutorid: id,
        subjectid: selectedSubject,
        gradeid: selectedGrade,
        fees: subjectFees
      });
      setSelectedGrade('');
      setSelectedSubject('');
      setSubjectFees('');
      setSubjectsByGrade([]);
      fetchData();
    } catch (err) {
      console.error('Error adding subject:', err);
    }
  };

  const handleRemoveSubject = async (subjectTutorId) => {
    if (!window.confirm('Are you sure you want to remove this subject?')) return;
    try {
      await api.delete(`/tutors/remove-subject/${id}/${subjectTutorId}`);
      fetchData();
    } catch (err) {
      console.error('Error removing subject:', err);
    }
  };

  const subjectColumns = [
    { label: 'Subject', accessor: 'subject', render: (val) => <span className="font-medium text-white">{val}</span> },
    { label: 'Grade', accessor: 'grade', render: (val) => <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">{val}</span> },
    { 
      label: 'Actions', 
      accessor: 'id', 
      render: (subTutorId) => (
        <button onClick={() => handleRemoveSubject(subTutorId)} className="text-textMuted hover:text-danger transition-colors">
          <Trash2 size={18} />
        </button>
      )
    }
  ];

  const gradeOptions = grades.map(g => ({ value: g.id, label: g.name }));
  const subjectOptions = subjectsByGrade.map(sub => ({ value: sub.id, label: sub.name }));

  return (
    <div className="flex flex-col min-h-screen">
      <Header type="dashboard" action="Logout" />
      <Navbar />
      <SectionHeader section="Edit Tutor" />
      
      <main className="flex-1 lg:ml-64 p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
        <button onClick={() => navigate('/tutor')} className="text-primary hover:text-primaryHover mb-6 inline-flex items-center gap-2 font-medium">
          &larr; Back to Tutors
        </button>

        {error && <div className="bg-danger/20 border border-danger/50 text-danger px-4 py-3 rounded-xl mb-6">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-1 border-r border-slate-700/50 pr-0 lg:pr-8">
            <Card title="Tutor Profile">
              <div className="space-y-4">
                <FormSelect 
                  label="Title" 
                  name="title" 
                  value={tutorData.title || ''} 
                  onChange={handleInputChange}
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
                <FormInput label="First Name" name="firstname" value={tutorData.firstname || ''} onChange={handleInputChange} />
                <FormInput label="Last Name" name="lastname" value={tutorData.lastname || ''} onChange={handleInputChange} />
                <FormInput label="Contact" name="contact" value={tutorData.contact || ''} onChange={handleInputChange} />
                
                <button onClick={handleSave} disabled={isSaving || loading} className="btn-primary w-full mt-4">
                  <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <Card title="Teaching Subjects">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 items-end">
                <div className="sm:col-span-1 md:col-span-1">
                  <FormSelect 
                    label="Grade"
                    name="selectedGrade" 
                    value={selectedGrade} 
                    onChange={(e) => handleGradeChange(e.target.value)}
                    options={gradeOptions}
                  />
                </div>
                <div className="sm:col-span-1 md:col-span-1">
                  <FormSelect 
                    label="Subject"
                    name="selectedSubject" 
                    value={selectedSubject} 
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    options={subjectOptions}
                    disabled={!subjectsByGrade.length}
                  />
                </div>
                <div className="sm:col-span-1 md:col-span-1 mb-1">
                  <FormInput 
                    label="Fees (LKR)"
                    name="subjectFees"
                    type="number"
                    value={subjectFees}
                    onChange={(e) => setSubjectFees(e.target.value)}
                    disabled={!selectedSubject}
                  />
                </div>
                <div className="sm:col-span-1 md:col-span-1 mb-5">
                  <button onClick={handleAddSubject} disabled={!selectedGrade || !selectedSubject || !subjectFees} className="btn-primary w-full h-[46px]">
                    <Plus size={18} /> Add
                  </button>
                </div>
              </div>
              
              <GenericTable 
                columns={subjectColumns} 
                data={subjects} 
                loading={loading} 
                emptyStateMessage="No subjects mapped yet."
              />
            </Card>
          </div>
          
        </div>
      </main>
    </div>
  );
};
