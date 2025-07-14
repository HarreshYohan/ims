import React from 'react';
import './Topbar.css';
import {  useNavigate } from 'react-router-dom';

function Topbar() {
      const navigate = useNavigate();
const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-logo">📘</span>
        <span className="topbar-title">IMS</span>
      </div>
        <div className="sidebar-logout">
            <button onClick={handleLogout}>🚪 Logout</button>
      </div>
    </header>

  );
}

export default Topbar;
