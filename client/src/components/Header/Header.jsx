import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import profile_icon from '../../assets/profile.png'



export const Header = ({type ,action}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  
  const handleProfileClick = () => {
    navigate('/profile');
  };

  const link = type === "welcome" ? "/" : "/dashboard";

  return (
    <header className="fixed-header">
      <div className="logo">
        <Link to={link}>
          {/* <img src={logo_icon} alt="Logo" /> */}
        </Link> 
      </div>
      <div className="header-actions">
        <button className="profile-btn" onClick={handleProfileClick}>
          <img src={profile_icon} alt="Profile" className="profile-icon" />
        </button>

        <button className="logout-btn-btn" onClick={handleLogout}>
          {action}
        </button>
      </div>
    </header>
  );
};


