import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Layout } from '../shared/Layout';
import { Card } from '../shared/Card';
import { 
  BookOpen, Users, Calendar, CreditCard, Clock, 
  TrendingUp, ChevronRight, Star 
} from 'lucide-react';

export const TutorDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const [profileRes, subjectsRes] = await Promise.allSettled([
        api.get(`/profile/${userId}`),
        api.get('/subject-tutors/all'),
      ]);

      const prof = profileRes.status === 'fulfilled' ? profileRes.value.data : {};
      setProfile(prof);

      // Filter subjects assigned to this tutor
      const allSubjects = subjectsRes.status === 'fulfilled' ? (subjectsRes.value.data?.data || []) : [];
      const mySubjects = allSubjects.filter(st => st.tutorid === (prof.id || prof.user_id));
      setSubjects(mySubjects);

      // Try to load schedule
      try {
        const scheduleRes = await api.get('/timetable/all');
        setSchedule(scheduleRes.data?.data || []);
      } catch (e) { setSchedule([]); }

      // Try to load payments
      try {
        const payRes = await api.get(`/tutor-payments/tutor/${prof.id || prof.user_id}`);
        setPayments(payRes.data?.data || payRes.data || []);
      } catch (e) { setPayments([]); }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout title="Tutor Dashboard"><div className="text-center text-textMuted py-16">Loading dashboard...</div></Layout>;

  const tutorName = profile ? `${profile.title || ''} ${profile.firstname || ''} ${profile.lastname || ''}`.trim() : 'Tutor';
  const totalStudents = subjects.reduce((sum, s) => sum + (s.studentCount || 0), 0);
  const totalEarnings = payments.reduce((sum, p) => sum + Number(p.received || 0), 0);

  // Get today's classes from timetable
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
      {/* Welcome Banner */}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile icon={BookOpen} label="My Subjects" value={subjects.length} color="bg-indigo-500" />
        <StatTile icon={Users} label="Total Students" value={totalStudents} color="bg-emerald-500" sub="across all subjects" />
        <StatTile icon={Calendar} label="Today" value={today.charAt(0).toUpperCase() + today.slice(1)} color="bg-purple-500" />
        <StatTile icon={CreditCard} label="Total Received" value={`$${totalEarnings.toLocaleString()}`} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Subjects */}
        <Card title="My Subjects" className="border-t-4 border-t-indigo-500">
          {subjects.length === 0 ? (
            <p className="text-textMuted text-sm py-4">No subjects assigned yet.</p>
          ) : (
            <div className="space-y-3 mt-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              {subjects.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 transition-colors border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <BookOpen size={18} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{s.subject}</p>
                      <p className="text-xs text-textMuted">{s.grade} • Fee: ${s.fees}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full">ID #{s.id}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Payment History */}
        <Card title="Payment History" className="border-t-4 border-t-amber-500">
          {payments.length === 0 ? (
            <p className="text-textMuted text-sm py-4">No payment records found.</p>
          ) : (
            <div className="space-y-3 mt-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              {payments.slice(0, 6).map((p, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][p.month]} {p.year}
                    </p>
                    <p className="text-xs text-textMuted mt-0.5">Total: ${Number(p.totalpayment).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${Number(p.received) >= Number(p.totalpayment) ? 'text-emerald-400' : 'text-amber-400'}`}>
                      ${Number(p.received).toLocaleString()}
                    </span>
                    <p className="text-xs text-textMuted">received</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
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
    </Layout>
  );
};
