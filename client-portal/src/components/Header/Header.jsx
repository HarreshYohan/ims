import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import logo_icon from '../../assets/IMS.png';
import profile_icon from '../../assets/profile.png';
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

export const Header = ({ type, action }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try { 
        const decoded = jwtDecode(token);
        setUserType(decoded.user_type);
        fetchProfile(decoded.user_id);
      } catch (e) {}
    }
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const res = await api.get(`/profile/${userId}`);
      setUserProfile(res.data);
    } catch (err) {
      console.error('Error fetching header profile:', err);
    }
  };

  // Broadcast menu state for Navbar to listen
  useEffect(() => {
    const event = new CustomEvent('toggleMobileMenu', { detail: isMobileMenuOpen });
    window.dispatchEvent(event);
  }, [isMobileMenuOpen]);

  // Close menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  // Role-aware branding
  const brandingMap = {
    TUTOR:   { label: 'Tutor',   link: '/tutor-dashboard' },
    STUDENT: { label: 'Portal',  link: '/student-portal' },
  };
  const branding = brandingMap[userType] || { label: 'Portal', link: '/student-portal' };
  const link = type === "welcome" ? "/" : branding.link;

  return (
    <header className="sticky top-0 z-50 w-full glass-card !rounded-none !border-t-0 !border-x-0 backdrop-blur-xl bg-[#0a0a0c]/70 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-textMuted hover:text-white transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link to={link} className="transition-transform hover:scale-105 active:scale-95">
          <img src={logo_icon} alt="Logo" className="h-10 w-auto" />
        </Link>
        <div className="h-6 w-[1px] bg-white/10 mx-2 hidden md:block" />
        <h1 className="text-lg font-semibold text-white tracking-tight hidden md:block">IMS <span className="text-primary">{branding.label}</span></h1>
      </div>

      <div className="flex items-center gap-4">
        {userType === 'STUDENT' && userProfile && (
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]">
              <span className="text-amber-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </span>
              <span className="text-xs font-bold text-amber-200">{userProfile.totalXP || 0} XP</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]">
              <span className="text-orange-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.292 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
              </span>
              <span className="text-xs font-bold text-orange-200">{userProfile.maxStreak || 0} Days</span>
            </div>
          </div>
        )}

        <button 
          className="flex items-center gap-2 p-1.5 pr-4 rounded-full border border-white/5 hover:bg-white/10 transition-all group hidden sm:flex" 
          onClick={handleProfileClick}
        >
          <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden border border-primary/30 flex items-center justify-center">
            {profile_icon ? <img src={profile_icon} alt="Profile" className="w-full h-full object-cover" /> : <UserIcon size={16} />}
          </div>
          <span className="text-sm font-medium text-textMuted group-hover:text-white transition-colors">
            {userProfile ? 
              ((userProfile.firstname || userProfile.lastname) ? 
                `${userProfile.firstname || ''} ${userProfile.lastname || ''}`.trim() : 
                (userProfile.user?.username || userProfile.username || 'Profile')) 
              : 'Profile'}
          </span>
        </button>

        <button 
          className="bg-danger/10 text-danger hover:bg-danger hover:text-white border border-danger/30 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-95 flex items-center gap-2" 
          onClick={handleLogout}
        >
          <LogOut size={16} />
          <span className="hidden xs:inline">{action || 'Logout'}</span>
        </button>
      </div>
    </header>
  );
};

