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

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Wrap protected routes inside Layout */}
        {isAuthenticated && (
          <>
            <Route
              path="/dashboard"
              element={<Layout><Dashboard /></Layout>}
            />
            <Route
              path="/timetable"
              element={<Layout><TimeTable /></Layout>}
            />
            <Route
              path="/notes"
              element={<Layout><Notes /></Layout>}
            />
            <Route
              path="/fees"
              element={<Layout><Fees /></Layout>}
            />
            <Route
              path="/profile"
              element={<Layout><Profile /></Layout>}
            />
          </>
        )}

        {/* Fallback redirect */}
        {!isAuthenticated && (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
