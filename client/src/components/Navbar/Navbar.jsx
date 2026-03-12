import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { 
  BarChart3, Calendar, User, Users, Building2, ArrowLeftRight, 
  BookOpen, FileText, ChevronDown, ChevronRight, GraduationCap,
  TrendingUp, ShieldCheck, Layers, Brain, Target, MessageSquare,
  CreditCard, Activity, Sparkles
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

export const Navbar = () => {
  const location = useLocation();
  const [isReportsOpen, setIsReportsOpen] = useState(
    location.pathname.startsWith('/report') || location.pathname === '/user-report' || location.pathname === '/revenue' || location.pathname === '/staff-payment'
  );
  const [isTutorOpen, setIstutorOpen] = useState(location.pathname.startsWith('/tutor'));
  const [isStudyOpen, setIsStudyOpen] = useState(location.pathname.startsWith('/student-'));
  const [userType, setUserType] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggle = (e) => setIsMobileOpen(e.detail);
    window.addEventListener('toggleMobileMenu', handleToggle);
    return () => window.removeEventListener('toggleMobileMenu', handleToggle);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try { setUserType(jwtDecode(token).user_type); } catch (err) {}
    }
  }, []);

  const NavItem = ({ to, icon: Icon, label, onClick, isOpen, hasChildren }) => (
    <div className="space-y-1">
      {to ? (
        <NavLink to={to} onClick={onClick}
          className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'text-textMuted hover:text-white hover:bg-slate-800/50 border border-transparent'}`}
        >
          <Icon size={20} className="transition-transform group-hover:scale-110" />
          <span className="font-medium text-sm">{label}</span>
          {hasChildren && (isOpen ? <ChevronDown size={16} className="ml-auto" /> : <ChevronRight size={16} className="ml-auto" />)}
        </NavLink>
      ) : (
        <button onClick={onClick}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${isOpen ? 'bg-slate-800/80 text-white' : 'text-textMuted hover:text-white hover:bg-slate-800/50'}`}
        >
          <div className="flex items-center gap-3">
            <Icon size={20} className="transition-transform group-hover:scale-110" />
            <span className="font-medium text-sm">{label}</span>
          </div>
          {hasChildren && (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </button>
      )}
    </div>
  );

  const navClass = `fixed left-0 top-[72px] bottom-0 w-64 glass-card !rounded-none !border-y-0 !border-l-0 bg-slate-900/90 backdrop-blur-2xl p-4 z-40 overflow-y-auto custom-scrollbar transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`;

  // ─── STUDENT NAV ─────────────────────────────────────────
  if (userType === 'STUDENT') {
    return (
      <nav className={navClass}>
        <NavItem to="/student-portal" icon={BarChart3} label="My Dashboard" />
        <NavItem to="/timetable" icon={Calendar} label="My Schedule" />
        <div>
          <NavItem icon={BookOpen} label="Study Hub" onClick={() => setIsStudyOpen(!isStudyOpen)} isOpen={isStudyOpen} hasChildren />
          {isStudyOpen && (
            <div className="ml-4 pl-4 border-l border-slate-800 mt-2 space-y-1 animate-in slide-in-from-left-2 duration-200">
              <NavItem to="/student-notes" icon={FileText} label="My Notes" />
              <NavItem to="/student-flashcards" icon={Layers} label="Flashcards" />
              <NavItem to="/student-quiz" icon={Brain} label="Quiz Arena" />
              <NavItem to="/student-goals" icon={Target} label="My Goals" />
            </div>
          )}
        </div>
        <NavItem to="/analytics" icon={Sparkles} label="AI Insights" />
        <NavItem to="/chatroom" icon={MessageSquare} label="Chatroom" />
        <NavItem to="/profile" icon={User} label="Profile" />
      </nav>
    );
  }

  // ─── TUTOR NAV ───────────────────────────────────────────
  if (userType === 'TUTOR') {
    return (
      <nav className={navClass}>
        <NavItem to="/tutor-dashboard" icon={BarChart3} label="My Dashboard" />
        <NavItem to="/timetable" icon={Calendar} label="My Schedule" />
        <NavItem to="/student" icon={GraduationCap} label="My Students" />
        <NavItem to="/classroom" icon={Building2} label="Classrooms" />
        <NavItem to="/analytics" icon={Sparkles} label="AI Insights" />
        <NavItem to="/chatroom" icon={MessageSquare} label="Chatroom" />
        <NavItem to="/profile" icon={User} label="Profile" />
      </nav>
    );
  }

  // ─── STAFF NAV ───────────────────────────────────────────
  if (userType === 'STAFF') {
    return (
      <nav className={navClass}>
        <NavItem to="/dashboard" icon={BarChart3} label="Dashboard" />
        <NavItem to="/timetable" icon={Calendar} label="Time Table" />
        <NavItem to="/student" icon={GraduationCap} label="Students" />
        <div>
          <NavItem icon={Users} label="Tutors" onClick={() => setIstutorOpen(!isTutorOpen)} isOpen={isTutorOpen} hasChildren />
          {isTutorOpen && (
            <div className="ml-4 pl-4 border-l border-slate-800 mt-2 space-y-1 animate-in slide-in-from-left-2 duration-200">
              <NavItem to="/tutor" icon={User} label="Directory" />
              <NavItem to="/tutor-payment" icon={CreditCard} label="Payments" />
            </div>
          )}
        </div>
        {/* Staff does NOT see Staff page */}
        <NavItem to="/classroom" icon={Building2} label="Classrooms" />
        <NavItem to="/grade" icon={GraduationCap} label="Grades" />
        <NavItem to="/transaction" icon={ArrowLeftRight} label="Transactions" />
        <NavItem to="/subject-tutor" icon={BookOpen} label="Subject Allocs" />
        <div>
          <NavItem to="/report" icon={FileText} label="Reports" onClick={() => setIsReportsOpen(!isReportsOpen)} isOpen={isReportsOpen} hasChildren />
          {isReportsOpen && (
            <div className="ml-4 pl-4 border-l border-slate-800 mt-2 space-y-1 animate-in slide-in-from-left-2 duration-200">
              <NavItem to="/user-report" icon={FileText} label="User Analytics" />
              <NavItem to="/revenue" icon={TrendingUp} label="Revenue Intel" />
              {/* Staff does NOT see Staff Salaries */}
            </div>
          )}
        </div>
        <NavItem to="/analytics" icon={Sparkles} label="AI Insights" />
        <NavItem to="/activity-log" icon={Activity} label="Activity Log" />
        <NavItem to="/profile" icon={User} label="Profile" />
      </nav>
    );
  }

  // ─── ADMIN NAV (Full access) ─────────────────────────────
  return (
    <nav className={navClass}>
      <NavItem to="/dashboard" icon={BarChart3} label="Dashboard" />
      <NavItem to="/timetable" icon={Calendar} label="Time Table" />
      <NavItem to="/student" icon={GraduationCap} label="Students" />
      <div>
        <NavItem icon={Users} label="Tutors" onClick={() => setIstutorOpen(!isTutorOpen)} isOpen={isTutorOpen} hasChildren />
        {isTutorOpen && (
          <div className="ml-4 pl-4 border-l border-slate-800 mt-2 space-y-1 animate-in slide-in-from-left-2 duration-200">
            <NavItem to="/tutor" icon={User} label="Directory" />
            <NavItem to="/tutor-payment" icon={CreditCard} label="Payments" />
          </div>
        )}
      </div>
      <NavItem to="/staff" icon={Users} label="Staff" />
      <NavItem to="/classroom" icon={Building2} label="Classrooms" />
      <NavItem to="/grade" icon={GraduationCap} label="Grades" />
      <NavItem to="/transaction" icon={ArrowLeftRight} label="Transactions" />
      <NavItem to="/subject-tutor" icon={BookOpen} label="Subject Allocs" />
      <div>
        <NavItem to="/report" icon={FileText} label="Reports" onClick={() => setIsReportsOpen(!isReportsOpen)} isOpen={isReportsOpen} hasChildren />
        {isReportsOpen && (
          <div className="ml-4 pl-4 border-l border-slate-800 mt-2 space-y-1 animate-in slide-in-from-left-2 duration-200">
            <NavItem to="/user-report" icon={FileText} label="User Analytics" />
            <NavItem to="/revenue" icon={TrendingUp} label="Revenue Intel" />
            <NavItem to="/staff-payment" icon={ShieldCheck} label="Staff Salaries" />
          </div>
        )}
      </div>
      <NavItem to="/analytics" icon={Sparkles} label="AI Insights" />
      <NavItem to="/activity-log" icon={Activity} label="Activity Log" />
      <NavItem to="/profile" icon={User} label="Profile" />
    </nav>
  );
};

