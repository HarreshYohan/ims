import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>👋 Welcome, Student!</h1>
          <p>Access all your academic tools below</p>
        </div>
      </header>

      <section className="dashboard-grid">
        <Link to="/timetable" className="dashboard-card timetable">
          <h2>📅 Time Table</h2>
          <p>View your weekly schedule</p>
        </Link>

        <Link to="/notes" className="dashboard-card notes">
          <h2>📝 Notes</h2>
          <p>Manage your subject notes</p>
        </Link>

        <Link to="/fees" className="dashboard-card fees">
          <h2>💰 Fees</h2>
          <p>Track your payments</p>
        </Link>

        <Link to="/profile" className="dashboard-card profile">
          <h2>👤 Profile</h2>
          <p>Update your personal info</p>
        </Link>
      </section>

      <div className="quote-card">
        <blockquote>
          “Education is the most powerful weapon which you can use to change the world.”
        </blockquote>
        <p className="quote-author">— Nelson Mandela</p>
      </div>
    </div>
  );
}

export default Dashboard;
