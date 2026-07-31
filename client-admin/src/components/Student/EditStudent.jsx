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
import { Modal } from '../shared/Modal';
import { Trash2, Save, Plus } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

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
  const [userRole, setUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({ month: '', year: new Date().getFullYear().toString(), amount: '' });
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!token) {
      localStorage.removeItem('authToken');
      navigate('/login');
    } else {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.user_type);
        setCurrentUserId(decoded.user_id);
      } catch (err) {
        console.error('Failed to decode token:', err);
      }
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
      setSubjects(subjectsRes.data?.data?.subjects || []);
      setAllSubjects(allSubjectsRes.data?.subjects || []);
      setGrades(Array.isArray(gradesRes.data) ? gradesRes.data.map(g => ({ label: g.name, value: g.name })) : []);
      setSyllabuses(Array.isArray(syllabusesRes.data) ? syllabusesRes.data.map(s => ({ label: s.name, value: String(s.id) })) : []);
    } catch (err) {
      setError('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchFeesOnly = useCallback(async () => {
    try {
      const feesRes = await api.get(`/student-fees/${id}`);
      setFeesData(feesRes.data || []);
    } catch (e) {
      console.error('Fees auto-refresh failed:', e);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchFeesOnly, 5000);
    return () => clearInterval(interval);
  }, [fetchData, fetchFeesOnly]);

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

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentData.month || !paymentData.year || !paymentData.amount) {
      toast.error('Please fill in all payment fields');
      return;
    }
    
    setIsSubmittingPayment(true);
    try {
      await api.post('/student-fees', {
        studentid: id,
        month: paymentData.month,
        year: paymentData.year,
        amount: parseFloat(paymentData.amount),
        status: 'PAID',
        user_id: currentUserId
      });
      toast.success('Payment recorded successfully');
      setIsPaymentModalOpen(false);
      setPaymentData({ month: '', year: new Date().getFullYear().toString(), amount: '' });
      fetchFeesOnly();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setIsSubmittingPayment(false);
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

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => ({ label: m, value: m }));
  const subjectOptions = (allSubjects || []).map(sub => ({ value: String(sub.id), label: sub.subject }));

  const totalSubjectFees = useMemo(() => {
    return subjects.reduce((sum, sub) => sum + (Number(sub.fees) || 0), 0);
  }, [subjects]);

  const totalPaid = useMemo(() => {
    return feesData.filter(f => f.status === 'PAID').reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  }, [feesData]);

  const tobePaid = Math.max(0, totalSubjectFees - totalPaid);

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
                <FormInput label="First Name" name="firstname" value={studentData.firstname || ''} onChange={handleInputChange} disabled={userRole === 'STAFF'} />
                <FormInput label="Last Name" name="lastname" value={studentData.lastname || ''} onChange={handleInputChange} disabled={userRole === 'STAFF'} />
                <FormInput label="Contact (10 Digits)" name="contact" value={studentData.contact || ''} onChange={handleInputChange} maxLength={10} />
                <FormSelect 
                  label="Grade" 
                  name="grade" 
                  value={studentData.grade || ''} 
                  onChange={handleInputChange}
                  options={grades}
                  disabled={userRole === 'STAFF'}
                />
                <FormSelect 
                  label="Syllabus" 
                  name="syllabusid" 
                  value={String(studentData.syllabusid || '')} 
                  onChange={handleInputChange}
                  options={syllabuses}
                  disabled={userRole === 'STAFF'}
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

            <Card title={
              <div className="flex items-center justify-between">
                <span>Fees History </span>
                {!loading && (
                  <div className="flex items-center gap-6">
                    <div className="text-sm font-medium flex gap-4">
                      <span className="text-slate-400">-Total Monthly Fees: <span className="text-black">${totalSubjectFees.toLocaleString()}</span></span>
                      {tobePaid > 0 && <span className="text-rose-400">To Be Paid: ${tobePaid.toLocaleString()}</span>}
                    </div>
                    {(userRole === 'STAFF' || userRole === 'ADMIN') && (
                      <button 
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1"
                      >Record Payment
                      </button>
                    )}
                  </div>
                )}
              </div>
            }>
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

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Record Payment">
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <FormSelect
            label="Month"
            name="month"
            value={paymentData.month}
            onChange={(e) => setPaymentData({ ...paymentData, month: e.target.value })}
            options={[{ label: 'Select Month', value: '' }, ...months]}
          />
          <FormInput
            label="Year"
            name="year"
            type="number"
            value={paymentData.year}
            onChange={(e) => setPaymentData({ ...paymentData, year: e.target.value })}
          />
          <FormInput
            label="Amount Paid ($)"
            name="amount"
            type="number"
            value={paymentData.amount}
            onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
          />
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 text-textMuted hover:text-red-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingPayment}
              className="btn-primary py-2 px-6"
            >
              {isSubmittingPayment ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
