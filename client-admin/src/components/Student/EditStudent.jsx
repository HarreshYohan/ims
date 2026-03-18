import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../Header/Header';
import { Navbar } from '../Navbar/Navbar';
import { SectionHeader } from '../SectionHeader/SectionHeader';
import { Card } from '../shared/Card';
import { GenericTable } from '../shared/GenericTable';
import { FormInput } from '../shared/FormInput';
import { FormSelect } from '../shared/FormSelect';
import { Trash2, Save, Plus } from 'lucide-react';

export const EditStudent = () => {
  const [studentData, setStudentData] = useState({});
  const [feesData, setFeesData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [grades, setGrades] = useState([]);
  const [syllabuses, setSyllabuses] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!token) {
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  }, [token, navigate]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentRes, feesRes, subjectsRes, allSubjectsRes, gradesRes, syllabusesRes] = await Promise.all([
        api.get(`/students/${id}`).catch(e => { console.error('Student fetch failed:', e); throw e; }),
        api.get(`/student-fees/${id}`).catch(e => { console.error('Fees fetch failed:', e); throw e; }),
        api.get(`/students/student-subject/${id}`).catch(e => { console.error('Enrolled subjects fetch failed:', e); return { data: { data: { subjects: [] } } }; }),
        api.get(`/student-subjects/subjects/${id}`).catch(e => { console.error('Available subjects fetch failed:', e); return { data: { subjects: [] } }; }),
        api.get('/grades').catch(e => { console.error('Grades fetch failed:', e); return { data: [] }; }),
        api.get('/syllabus').catch(e => { console.error('Syllabus fetch failed:', e); return { data: [] }; })
      ]);

      setStudentData(studentRes.data || {});
      setFeesData(feesRes.data || []);
      setSubjects(subjectsRes.data.data?.subjects || []);
      setAllSubjects(allSubjectsRes.data?.subjects || []);
      setGrades(Array.isArray(gradesRes.data) ? gradesRes.data.map(g => ({ label: g.name, value: g.name })) : []);
      setSyllabuses(Array.isArray(syllabusesRes.data) ? syllabusesRes.data.map(s => ({ label: s.name, value: String(s.id) })) : []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to load student data: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isFormValid = useMemo(() => {
    return (
      studentData?.firstname && studentData.firstname.trim() !== '' &&
      studentData?.lastname && studentData.lastname.trim() !== '' &&
      studentData?.contact && studentData.contact.toString().length === 10 &&
      studentData?.grade && studentData.grade.trim() !== '' &&
      studentData?.syllabusid
    );
  }, [studentData]);

  const handleInputChange = (e) => setStudentData({ ...studentData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put(`/students/${id}`, studentData);
      toast.success('Student updated successfully!');
      navigate('/student');
    } catch (err) {
      console.error('Error saving student:', err);
      toast.error('Failed to update student');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSubject = async (subjectid) => {
    if (!window.confirm('Are you sure you want to remove this subject?')) return;
    try {
      await api.delete(`/student-subjects/remove-subject/${id}/${subjectid}`);
      toast.success('Subject removed');
      fetchData(); // Reload all data to refresh dropdowns and lists
    } catch (err) {
      console.error('Error removing subject:', err);
      toast.error('Failed to remove subject');
    }
  };

  const handleAddSubject = async () => {
    if (!selectedSubject) return;
    try {
      await api.post('/student-subjects/add-subject', { studentid: id, subjectid: selectedSubject });
      toast.success('Subject added');
      setSelectedSubject('');
      fetchData();
    } catch (err) {
      console.error('Error adding subject:', err);
      toast.error('Failed to add subject');
    }
  };

  const subjectColumns = [
    { label: 'Subject Name', accessor: 'subject', render: (val) => <span className="font-medium text-slate-200">{val}</span> },
    { 
      label: 'Actions', 
      accessor: 'subject_id', 
      render: (subId) => (
        <button onClick={() => handleRemoveSubject(subId)} className="text-textMuted hover:text-danger transition-colors">
          <Trash2 size={18} />
        </button>
      )
    }
  ];

  const feeColumns = [
    { label: 'Month', accessor: 'month' },
    { label: 'Year', accessor: 'year' },
    { label: 'Amount', accessor: 'amount', render: (val) => <span className="text-secondary font-medium">${val}</span> },
    { 
      label: 'Status', 
      accessor: 'status',
      render: (val) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${val === 'PAID' ? 'bg-secondary/20 text-secondary' : 'bg-danger/20 text-danger'}`}>
          {val}
        </span>
      )
    }
  ];

  const subjectOptions = (allSubjects || []).map(sub => ({ value: String(sub.id), label: sub.subject }));

  return (
    <div className="flex flex-col min-h-screen">
      <Header type="dashboard" action="Logout" />
      <Navbar />
      <SectionHeader section="Edit Student Profile" is_create={false} />
      
      <main className="flex-1 lg:ml-64 p-6 lg:p-10 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
        <button onClick={() => navigate('/student')} className="text-primary hover:text-primaryHover mb-6 inline-flex items-center gap-2 font-medium">
          &larr; Back to Students
        </button>

        {error && <div className="bg-danger/20 border border-danger/50 text-danger px-4 py-3 rounded-xl mb-6">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Column 1: Profile Editing */}
          <div className="lg:col-span-1 border-r border-slate-700/50 pr-0 lg:pr-8">
            <Card title="Student Profile">
              <div className="space-y-4">
                <FormInput label="First Name" name="firstname" value={studentData.firstname || ''} onChange={handleInputChange} />
                <FormInput label="Last Name" name="lastname" value={studentData.lastname || ''} onChange={handleInputChange} />
                <FormInput label="Contact (10 Digits)" name="contact" value={studentData.contact || ''} onChange={handleInputChange} maxLength={10} />
                <FormSelect 
                  label="Grade" 
                  name="grade" 
                  value={studentData.grade || ''} 
                  onChange={handleInputChange}
                  options={grades}
                />
                <FormSelect 
                  label="Syllabus" 
                  name="syllabusid" 
                  value={String(studentData.syllabusid || '')} 
                  onChange={handleInputChange}
                  options={syllabuses}
                />
                
                <button 
                  onClick={handleSave} 
                  disabled={isSaving || loading || !isFormValid} 
                  className="btn-primary w-full mt-4 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </Card>
          </div>

          {/* Column 2 & 3: Relationships (Subjects & Fees) */}
          <div className="lg:col-span-2 space-y-8">
            <Card title="Enrolled Subjects">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <FormSelect 
                    name="selectedSubject" 
                    value={selectedSubject} 
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    options={subjectOptions}
                  />
                </div>
                <button onClick={handleAddSubject} disabled={!selectedSubject} className="btn-primary h-[46px]">
                  <Plus size={18} /> Add Subject
                </button>
              </div>
              
              <GenericTable 
                columns={subjectColumns} 
                data={subjects} 
                loading={loading} 
                emptyStateMessage="No subjects enrolled yet."
              />
            </Card>

            <Card title="Fees History">
              <GenericTable 
                columns={feeColumns} 
                data={feesData} 
                loading={loading}
                emptyStateMessage="No fee records found."
              />
            </Card>
          </div>
          
        </div>
      </main>
    </div>
  );
};
