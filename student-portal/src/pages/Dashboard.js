import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import './Dashboard.css';
import api from '../services/api';

function Dashboard() {
  const [studentName, setStudentName] = useState('Student');
  const [studentId, setStudentId] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalClasses: 0,
    totalNotes: 0,
    nextPaymentDate: '',
    activeGoals: 0,
  });


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setStudentName(decoded.username || decoded.email || 'Student');
        setStudentId(decoded.user_id);
        console.log(decoded)
      } catch (err) {
        console.error('Invalid token:', err);
        setStudentName('Student');
      }
    }
  }, []);

    useEffect(() => {
    if (!studentId) return;

    const fetchData = async () => {
      try {
        const [classRes, notesRes, feesRes, goalsRes] = await Promise.all([
          api.get(`/timetable/student-count/${studentId}`),
          api.get(`/notes/count/${studentId}`),
          api.get(`/student-fees/last-paid/${studentId}`),
          // api.get(`/api/goals/active-count/${studentId}`),
        ]);
        setDashboardData({
          totalClasses: classRes.data.data,
          totalNotes: notesRes.data.totalNotes,
          nextPaymentDate: feesRes.data.nextPaymentDate,
          // activeGoals: goalsRes.data.activeGoals,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
      fetchData();
  }, [studentId]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>👋 Welcome, {studentName}!</h1>
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
          <p>last payment done on {new Date(dashboardData.nextPaymentDate).toLocaleDateString()}</p>
        </Link>

        <Link to="/goals" className="dashboard-card profile">
          <h2>🎯 Goals</h2>
          <p>Track your goals</p>
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
