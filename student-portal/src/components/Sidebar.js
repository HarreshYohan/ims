import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">🎓 Student</div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>🏠 Dashboard</NavLink>
        <NavLink to="/timetable" className={({ isActive }) => isActive ? 'active' : ''}>📅 Time Table</NavLink>
        <NavLink to="/notes" className={({ isActive }) => isActive ? 'active' : ''}>📝 Notes</NavLink>
        <NavLink to="/fees" className={({ isActive }) => isActive ? 'active' : ''}>💰 Fees</NavLink>
        <NavLink to="/goals" className={({ isActive }) => isActive ? 'active' : ''}>🎯 Goals</NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>👤 Profile</NavLink>
      </nav>


    </div>
  );
}

export default Sidebar;
