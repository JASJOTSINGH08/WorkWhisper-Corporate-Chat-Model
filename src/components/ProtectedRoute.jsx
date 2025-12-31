import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  // If username is just email (default fallback), redirect to set-username
  if (user.username === user.email) {
    return <Navigate to="/set-username" />;
  }

  return children;
};

export default ProtectedRoute;
