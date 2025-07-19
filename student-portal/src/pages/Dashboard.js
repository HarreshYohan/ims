import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Dashboard.css';
import api from '../services/api';

function Dashboard() {
  const [userName, setUserName] = useState('User');
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalClasses: 0,
    totalNotes: 0,
    nextPaymentDate: '',
    activeGoals: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName(decoded.username || decoded.email || 'User');
        setUserId(decoded.user_id);
        setRole(decoded.user_type);
      } catch (err) {
        console.error('Invalid token:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (!userId || !role) return;

    const fetchDashboardData = async () => {
      try {
        if (role === 'STUDENT') {
          const [classRes, notesRes, feesRes, goalsRes] = await Promise.all([
            api.get(`/timetable/student-count/${userId}`),
            api.get(`/notes/count/${userId}`),
            api.get(`/student-fees/last-paid/${userId}`),
            api.get(`/goals/active-count/${userId}`),
          ]);
          setDashboardData({
            totalClasses: classRes.data.data,
            totalNotes: notesRes.data.totalNotes,
            nextPaymentDate: feesRes.data.nextPaymentDate,
            activeGoals: goalsRes.data.activeGoals,
          });
        } else if (role === 'TUTOR') {
          const [classRes, notesRes, feesRes, goalsRes] = await Promise.all([
            api.get(`/timetable/tutor-count/${userId}`),
            api.get(`/notes/count-tutor/${userId}`),
            api.get(`/student-fees/last-paid/${userId}`),
            api.get(`/goals/active-count-tutor/${userId}`),
          ]);
          setDashboardData({
            totalClasses: classRes.data.data,
            totalNotes: notesRes.data.totalNotes,
            nextPaymentDate: feesRes.data.nextPaymentDate,
            activeGoals: goalsRes.data.activeGoals,
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, [userId, role]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return isNaN(date) ? 'N/A' : date.toLocaleDateString();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>👋 Welcome, {role === 'TUTOR' ? 'Tutor ' : ''}{userName}!</h1>
          <p>Access all your academic tools below</p>
        </div>
      </header>

      <section className="dashboard-grid">
        <Link to="/timetable" className="dashboard-card timetable">
          <h2>📅 Time Table</h2>
          <h3>View your weekly schedule</h3>
          <p>{dashboardData.totalClasses} classes this week</p>
        </Link>

        <Link to="/notes" className="dashboard-card notes">
          <h2>📝 Notes</h2>
          <h3>Manage your subject notes</h3>
          <p>{dashboardData.totalNotes} notes saved</p>
        </Link>

        <Link to="/fees" className="dashboard-card fees">
          <h2>💰 Fees</h2>
          <h3>Track your payments</h3>
          <p>Last payment: {formatDate(dashboardData.nextPaymentDate)}</p>
        </Link>

        <Link to="/goals" className="dashboard-card goals">
          <h2>🎯 Goals</h2>
          <h3>Track your goals</h3>
          <p>{dashboardData.activeGoals} active goals</p>
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
