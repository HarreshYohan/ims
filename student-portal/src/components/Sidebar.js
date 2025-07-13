import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">🎓 Student</div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>🏠 Dashboard</NavLink>
        <NavLink to="/timetable" className={({ isActive }) => isActive ? 'active' : ''}>📅 Time Table</NavLink>
        <NavLink to="/notes" className={({ isActive }) => isActive ? 'active' : ''}>📝 Notes</NavLink>
        <NavLink to="/fees" className={({ isActive }) => isActive ? 'active' : ''}>💰 Fees</NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>👤 Profile</NavLink>
      </nav>

      <div className="sidebar-logout">
        <button onClick={handleLogout}>🚪 Logout</button>
      </div>
    </div>
  );
}

export default Sidebar;
