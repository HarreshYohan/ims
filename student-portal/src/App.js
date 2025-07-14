import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TimeTable from './pages/TimeTable';
import Notes from './pages/Notes';
import Fees from './pages/Fees';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Layout from './components/Layout';
import GoalTracker from './pages/GoalTracker';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes inside Layout */}
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />}
        />
        <Route
          path="/timetable"
          element={isAuthenticated ? <Layout><TimeTable /></Layout> : <Navigate to="/login" />}
        />
        <Route
          path="/notes"
          element={isAuthenticated ? <Layout><Notes /></Layout> : <Navigate to="/login" />}
        />
        <Route
          path="/fees"
          element={isAuthenticated ? <Layout><Fees /></Layout> : <Navigate to="/login" />}
        />
        <Route
          path="/goals"
          element={isAuthenticated ? <Layout><GoalTracker /></Layout> : <Navigate to="/login" />}
        />

        <Route
          path="/profile"
          element={isAuthenticated ? <Layout><Profile /></Layout> : <Navigate to="/login" />}
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
