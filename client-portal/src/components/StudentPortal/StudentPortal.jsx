import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../../services/api';
import { Layout } from '../shared/Layout';
import { Card } from '../shared/Card';
import {
  BookOpen, Target, Flame, Brain, Calendar, Award,
  TrendingUp, FileText, Layers, Zap, ChevronRight
} from 'lucide-react';

export const StudentPortal = () => {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState('');
  const [userId, setUserId] = useState(null);
  const [stats, setStats] = useState({
    totalNotes: 0, activeGoals: 0, streak: 0,
    flashcardsDue: 0, flashcardsMastery: 0,
    quizAvg: 0, totalQuizzes: 0
  });
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.user_id);
        fetchAll(decoded.user_id);
      } catch (e) { console.error(e); }
    }
  }, []);

  const fetchAll = async (uid) => {
    setLoading(true);
    try {
      const [profileRes, notesRes, goalsRes, streakRes, flashRes, quizRes, schedRes] = await Promise.allSettled([
        api.get(`/profile/${uid}`),
        api.get(`/notes/count/${uid}`),
        api.get(`/goals/active/${uid}`),
        api.get(`/goals/streak/${uid}`),
        api.get(`/flashcards/stats/${uid}`),
        api.get(`/quiz/history/${uid}`),
        api.get(`/timetable/student/${uid}`)
      ]);

      if (profileRes.status === 'fulfilled') {
        const p = profileRes.value.data;
        setStudentName(p.firstname || 'Student');
      }

      setStats({
        totalNotes: notesRes.status === 'fulfilled' ? notesRes.value.data.totalNotes || 0 : 0,
        activeGoals: goalsRes.status === 'fulfilled' ? goalsRes.value.data.activeGoals || 0 : 0,
        streak: streakRes.status === 'fulfilled' ? Math.round(streakRes.value.data.average_streak || 0) : 0,
        flashcardsDue: flashRes.status === 'fulfilled' ? flashRes.value.data.due || 0 : 0,
        flashcardsMastery: flashRes.status === 'fulfilled' ? flashRes.value.data.masteryPercent || 0 : 0,
        quizAvg: quizRes.status === 'fulfilled' ? quizRes.value.data.stats?.avgScore || 0 : 0,
        totalQuizzes: quizRes.status === 'fulfilled' ? quizRes.value.data.stats?.totalQuizzes || 0 : 0
      });

      if (schedRes.status === 'fulfilled') {
        setSchedule((schedRes.value.data.data || []).slice(0, 5));
      }
    } catch (err) {
      console.error('Portal fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatTile = ({ icon: Icon, label, value, color, sub, onClick }) => (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border border-white/5 p-5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${onClick ? 'cursor-pointer' : ''}`}
      style={{ background: `linear-gradient(135deg, ${color}15, ${color}05)` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
          <h3 className="text-3xl font-black text-white">{loading ? '...' : value}</h3>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className="p-3 rounded-xl" style={{ background: `${color}20` }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
      {onClick && (
        <div className="absolute bottom-2 right-3 opacity-30">
          <ChevronRight size={16} className="text-white" />
        </div>
      )}
    </div>
  );

  const QuickAction = ({ icon: Icon, label, desc, color, path }) => (
    <button
      onClick={() => navigate(path)}
      className="flex items-center gap-4 w-full p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group text-left"
    >
      <div className="p-3 rounded-xl shrink-0" style={{ background: `${color}15` }}>
        <Icon size={22} style={{ color }} className="group-hover:scale-110 transition-transform" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="text-xs text-slate-500 truncate">{desc}</p>
      </div>
      <ChevronRight size={18} className="text-slate-600 group-hover:text-white transition-colors shrink-0" />
    </button>
  );

  return (
    <Layout title="Student Portal">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 p-8 mb-2"
        style={{ background: 'linear-gradient(135deg, #6366f120 0%, #8b5cf620 50%, #06b6d420 100%)' }}
      >
        <div className="relative z-10">
          <p className="text-slate-400 text-sm font-medium">Welcome back,</p>
          <h1 className="text-4xl font-black text-white mt-1">
            {studentName} <span className="text-3xl">👋</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {stats.flashcardsDue > 0
              ? `You have ${stats.flashcardsDue} flashcards due for review today!`
              : 'All caught up! Great work on your studies.'}
          </p>
        </div>

        {/* Streak Fire */}
        {stats.streak > 0 && (
          <div className="absolute top-6 right-8 flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2">
            <Flame size={20} className="text-orange-400 animate-pulse" />
            <span className="text-orange-400 font-black text-lg">{stats.streak}</span>
            <span className="text-orange-400/60 text-xs font-medium">day streak</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile icon={FileText} label="My Notes" value={stats.totalNotes} color="#6366f1" sub="Total created" onClick={() => navigate('/student-notes')} />
        <StatTile icon={Layers} label="Flashcards Due" value={stats.flashcardsDue} color="#f59e0b" sub={`${stats.flashcardsMastery}% mastered`} onClick={() => navigate('/student-flashcards')} />
        <StatTile icon={Target} label="Active Goals" value={stats.activeGoals} color="#10b981" sub="In progress" onClick={() => navigate('/student-goals')} />
        <StatTile icon={Brain} label="Quiz Average" value={`${stats.quizAvg}%`} color="#8b5cf6" sub={`${stats.totalQuizzes} quizzes taken`} onClick={() => navigate('/student-quiz')} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <Card title="Quick Actions">
            <div className="space-y-3">
              <QuickAction icon={FileText} label="Create Note" desc="Write and submit for review" color="#6366f1" path="/student-notes" />
              <QuickAction icon={Layers} label="Study Flashcards" desc={`${stats.flashcardsDue} cards due today`} color="#f59e0b" path="/student-flashcards" />
              <QuickAction icon={Brain} label="Take a Quiz" desc="Test your knowledge" color="#8b5cf6" path="/student-quiz" />
              <QuickAction icon={Target} label="Set a Goal" desc="Track your progress" color="#10b981" path="/student-goals" />
            </div>
          </Card>
        </div>

        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <Card title="Today's Schedule" action={
            <button onClick={() => navigate('/timetable')} className="text-xs text-primary hover:text-white transition-colors font-medium">
              View Full Schedule →
            </button>
          }>
            {schedule.length > 0 ? (
              <div className="space-y-3">
                {schedule.map((cls, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="bg-emerald-400/10 text-emerald-400 px-3 py-2 rounded-lg text-xs font-bold min-w-[80px] text-center">
                      {cls.timeslot}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{cls.subject}</p>
                      <p className="text-xs text-slate-500 capitalize">{cls.day}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500">
                <Calendar size={32} className="mx-auto opacity-20 mb-2" />
                <p className="text-sm">No classes scheduled for today</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};
