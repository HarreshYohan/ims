import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

/**
 * ProtectedRoute — wraps a route and redirects to /login if unauthenticated.
 * Also checks token expiry so expired sessions don't silently persist.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      return <Navigate to="/login" replace />;
    }

    // Role validation
    const userRole = decoded.user_type;
    if (userRole !== 'ADMIN' && userRole !== 'STAFF') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      return <Navigate to="/login" replace />;
    }
  } catch {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
