import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo_icon from '../../assets/IMS.png';
import profile_icon from '../../assets/profile.png';
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

export const Header = ({ type, action }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try { setUserType(jwtDecode(token).user_type); } catch (e) {}
    }
  }, []);

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
    ADMIN:   { label: 'Admin',   link: '/dashboard' },
    STAFF:   { label: 'Staff',   link: '/dashboard' },
    TUTOR:   { label: 'Tutor',   link: '/tutor-dashboard' },
    STUDENT: { label: 'Portal',  link: '/student-portal' },
  };
  const branding = brandingMap[userType] || { label: 'Admin', link: '/dashboard' };
  const link = type === "welcome" ? "/" : branding.link;

  return (
    <header className="sticky top-0 z-50 w-full glass-card !rounded-none !border-t-0 !border-x-0 backdrop-blur-xl bg-slate-900/80 px-6 py-4 flex items-center justify-between">
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
        <div className="h-6 w-[1px] bg-slate-700 mx-2 hidden md:block" />
        <h1 className="text-lg font-semibold text-white tracking-tight hidden md:block">IMS <span className="text-primary">{branding.label}</span></h1>
      </div>

      <div className="flex items-center gap-4">
        <button 
          className="flex items-center gap-2 p-1.5 pr-4 rounded-full border border-slate-700/50 hover:bg-slate-800 transition-all group hidden sm:flex" 
          onClick={handleProfileClick}
        >
          <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden border border-primary/30 flex items-center justify-center">
            {profile_icon ? <img src={profile_icon} alt="Profile" className="w-full h-full object-cover" /> : <UserIcon size={16} />}
          </div>
          <span className="text-sm font-medium text-textMuted group-hover:text-white transition-colors">Profile</span>
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

