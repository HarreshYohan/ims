import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Layout } from '../shared/Layout';
import { Card } from '../shared/Card';
import { Modal } from '../shared/Modal';
import { FormInput } from '../shared/FormInput';
import { 
  BookOpen, Users, Calendar, CreditCard, Clock, 
  TrendingUp, ChevronRight, Star, Edit3
} from 'lucide-react';

export const TutorDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [newFee, setNewFee] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        loadDashboard(decoded.user_id);
      } catch (e) { console.error(e); }
    }
  }, []);

  const loadDashboard = async (userId) => {
    try {
      const [profileRes] = await Promise.allSettled([
        api.get(`/profile/${userId}`),
      ]);

      const prof = profileRes.status === 'fulfilled' ? profileRes.value.data : {};
      setProfile(prof);

      // Now fetch subjects specifically for this tutor with a high limit
      try {
        const tutorId = prof.id || prof.user_id;
        
        // Fetch raw subjects
        const subRes = await api.get(`/subject-tutors/all?tutorid=${tutorId}&limit=1000`);
        let tutorSubjects = subRes.data?.data || [];
        
        // Fetch summary to get student counts
        try {
          const summaryRes = await api.get('/tutor-payments/summary');
          const summaryData = summaryRes.data?.data || [];
          
          // Merge studentCount into subjects
          tutorSubjects = tutorSubjects.map(sub => {
            // Match based on subjecttutorid to avoid duplicates
            const summaryMatch = summaryData.find(s => s.subjecttutorid === sub.id);
            return {
              ...sub,
              studentCount: summaryMatch ? summaryMatch.studentCount : 0
            };
          });
        } catch (sumErr) {
          console.error("Failed to fetch student counts", sumErr);
        }
        
        setSubjects(tutorSubjects);
      } catch (e) {
        setSubjects([]);
      }

      try {
        const scheduleRes = await api.get('/timetable/all');
        setSchedule(scheduleRes.data?.data || []);
      } catch (e) { setSchedule([]); }

      try {
        const tutorId = prof.id || prof.user_id;
        const payRes = await api.get(`/tutor-payments`);
        const allPayments = payRes.data?.data || payRes.data || [];
        setPayments(allPayments.filter(p => p.tutorid === tutorId));
      } catch (e) { setPayments([]); }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditFee = (subject) => {
    setEditingSubject(subject);
    setNewFee(subject.fees);
    setIsEditModalOpen(true);
  };

  const handleUpdateFee = async (e) => {
    e.preventDefault();
    if (!newFee || parseFloat(newFee) <= 0) {
      return toast.error('Please enter a valid fee amount');
    }
    setIsUpdating(true);
    try {
      await api.put(`/subject-tutors/${editingSubject.id}`, { fees: parseFloat(newFee) });
      toast.success('Fee updated successfully');
      setIsEditModalOpen(false);
      loadDashboard(profile?.user_id);
    } catch (err) {
      toast.error('Failed to update fee');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <Layout title="Tutor Dashboard"><div className="text-center text-textMuted py-16">Loading dashboard...</div></Layout>;

  const tutorName = profile ? `${profile.title || ''} ${profile.firstname || ''} ${profile.lastname || ''}`.trim() : 'Tutor';
  const totalStudents = subjects.reduce((sum, s) => sum + (s.studentCount || 0), 0);
  const totalEarnings = payments.reduce((sum, p) => sum + Number(p.received || 0), 0);

  const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const today = dayNames[new Date().getDay()];

  const StatTile = ({ icon: Icon, label, value, color, sub }) => (
    <div className="glass-card p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-textMuted uppercase tracking-wider">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  return (
    <Layout title="Tutor Dashboard">
      <div className="glass-card p-6 mb-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back, {tutorName} 👋</h2>
            <p className="text-textMuted text-sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-xl border border-primary/30">
            <Star size={16} className="text-primary" />
            <span className="text-primary font-semibold text-sm">{subjects.length} Active Subjects</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile icon={BookOpen} label="My Subjects" value={subjects.length} color="bg-indigo-500" />
        <StatTile icon={Users} label="Total Students" value={totalStudents} color="bg-emerald-500" sub="across all subjects" />
        <StatTile icon={Calendar} label="Today" value={today.charAt(0).toUpperCase() + today.slice(1)} color="bg-purple-500" />
        <StatTile icon={CreditCard} label="Total Received" value={`$${totalEarnings.toLocaleString()}`} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="My Subjects" className="border-t-4 border-t-indigo-500">
          {subjects.length === 0 ? (
            <p className="text-textMuted text-sm py-4">No subjects assigned yet.</p>
          ) : (
            <div className="space-y-3 mt-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              {subjects.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 transition-colors border border-slate-700/30 group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <BookOpen size={18} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{s.subject} <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded ml-2 uppercase">{s.syllabus || 'N/A'}</span></p>
                      <p className="text-xs text-textMuted">{s.grade} • Fee: <span className="text-emerald-400 font-bold">LKR {s.fees}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEditFee(s)} className="p-2 rounded-lg bg-white/5 text-textMuted hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all">
                      <Edit3 size={16} />
                    </button>
                    <span className="text-[10px] text-slate-500 bg-slate-900/50 px-2 py-0.5 rounded-full uppercase tracking-tighter">#{s.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Payment History" className="border-t-4 border-t-amber-500">
          {payments.length === 0 ? (
            <p className="text-textMuted text-sm py-4">No payment records found.</p>
          ) : (
            <div className="mt-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-900 z-10">
                  <tr className="border-b border-slate-700/50">
                    <th className="py-3 px-4 text-xs font-semibold text-textMuted uppercase tracking-wider">Month</th>
                    <th className="py-3 px-4 text-xs font-semibold text-textMuted uppercase tracking-wider">Paid Amount</th>
                    <th className="py-3 px-4 text-xs font-semibold text-textMuted uppercase tracking-wider text-right">Date Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, i) => (
                    <tr key={i} className="border-b border-slate-700/20 hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-sm text-white">
                        {['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][p.month]} {p.year}
                      </td>
                      <td className={`py-3 px-4 text-sm font-bold ${Number(p.received) >= Number(p.totalpayment) ? 'text-emerald-400' : 'text-amber-400'}`}>
                        LKR {Number(p.received).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-textMuted text-right">
                        {p.receiveddate ? new Date(p.receiveddate).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Quick Actions">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {[
              { label: 'My Schedule', icon: Calendar, route: '/timetable', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
              { label: 'My Students', icon: Users, route: '/student', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
              { label: 'Classrooms', icon: Clock, route: '/classroom', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
              { label: 'Chatroom', icon: TrendingUp, route: '/chatroom', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
            ].map(({ label, icon: Icon, route, color }) => (
              <button key={label} onClick={() => navigate(route)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:scale-[1.02] ${color}`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span className="font-medium text-sm">{label}</span>
                </div>
                <ChevronRight size={16} className="opacity-50" />
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Subject Fee">
        <form onSubmit={handleUpdateFee}>
          <div className="space-y-4">
            <p className="text-sm text-textMuted">Updating fee for <span className="text-white font-bold">{editingSubject?.subject}</span> ({editingSubject?.grade})</p>
            <FormInput 
              label="Monthly Fee (LKR)" 
              type="number" 
              value={newFee} 
              onChange={(e) => setNewFee(e.target.value)} 
              required 
              autoFocus
            />
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 rounded-lg text-textMuted hover:bg-slate-800 transition-colors font-medium">
              Cancel
            </button>
            <button type="submit" disabled={isUpdating} className="btn-primary">
              {isUpdating ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
