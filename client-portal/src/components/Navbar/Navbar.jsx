import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { 
  BarChart3, Calendar, User, Building2, 
  BookOpen, FileText, ChevronDown, ChevronRight, GraduationCap,
  Layers, Brain, Target, MessageSquare,
  Sparkles
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

export const Navbar = () => {
  const location = useLocation();
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
          className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'text-textMuted hover:text-white hover:bg-white/5 border border-transparent'}`}
        >
          <Icon size={20} className="transition-transform group-hover:scale-110" />
          <span className="font-medium text-sm">{label}</span>
          {hasChildren && (isOpen ? <ChevronDown size={16} className="ml-auto" /> : <ChevronRight size={16} className="ml-auto" />)}
        </NavLink>
      ) : (
        <button onClick={onClick}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${isOpen ? 'bg-white/10 text-white' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
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

  const navClass = `fixed left-0 top-[72px] bottom-0 w-64 glass-card !rounded-none !border-y-0 !border-l-0 bg-[#0a0a0c]/80 backdrop-blur-2xl p-4 z-40 overflow-y-auto custom-scrollbar transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`;

  // ─── STUDENT NAV ─────────────────────────────────────────
  if (userType === 'STUDENT') {
    return (
      <nav className={navClass}>
        <NavItem to="/student-portal" icon={BarChart3} label="My Dashboard" />
        <NavItem to="/timetable" icon={Calendar} label="My Schedule" />
        <NavItem to="/student-notes" icon={FileText} label="My Notes" />
        <NavItem to="/student-flashcards" icon={Layers} label="Flashcards" />
        <NavItem to="/student-quiz" icon={Brain} label="Quiz Arena" />
        <NavItem to="/student-goals" icon={Target} label="My Goals" />
        <NavItem to="/ai-insight" icon={Sparkles} label="AI Insights" />
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
        <NavItem to="/tutor-schedule-approvals" icon={Calendar} label="Class Approvals" />
        <NavItem to="/student" icon={GraduationCap} label="My Students" />
        <NavItem to="/classroom" icon={Building2} label="Classrooms" />
        <NavItem to="/ai-insight" icon={Sparkles} label="AI Insights" />
        <NavItem to="/chatroom" icon={MessageSquare} label="Chatroom" />
        <NavItem to="/profile" icon={User} label="Profile" />
      </nav>
    );
  }

  // Deny cross-app access fallback
  return null;
};

