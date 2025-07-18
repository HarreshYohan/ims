import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Sidebar.css';

function Sidebar() {

  const [role, setRole] = useState();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log(token)
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.user_type === 'TUTOR') {
          setRole('Tutor');
        } else {
          setRole('Student');
        }
      } catch (err) {
        console.error('Invalid token:', err);
      }
    }
  }, []);

  return (
    <div className="sidebar">
      <div className="sidebar-logo">🎓 {role}</div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>🏠 Dashboard</NavLink>
        <NavLink to="/timetable" className={({ isActive }) => isActive ? 'active' : ''}>📅 Time Table</NavLink>
        {role === 'Student' && (
          <>
          <NavLink to="/notes" className={({ isActive }) => isActive ? 'active' : ''}>📝 Notes</NavLink>
          <NavLink to="/fees" className={({ isActive }) => isActive ? 'active' : ''}>💰 Fees</NavLink>
          <NavLink to="/goals" className={({ isActive }) => isActive ? 'active' : ''}>🎯 Goals</NavLink>
          </>
        )}

        {role === 'Tutor' && (
          <>
          <NavLink to="/tutor-notes" className={({ isActive }) => isActive ? 'active' : ''}>📝 Notes</NavLink>
          <NavLink to="/tutor-fees" className={({ isActive }) => isActive ? 'active' : ''}>💰Salary</NavLink>
          <NavLink to="/tutor-goals" className={({ isActive }) => isActive ? 'active' : ''}>🎯 Goals</NavLink>
          </>
        )}
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>👤 Profile</NavLink>
      </nav>


    </div>
  );
}

export default Sidebar;
