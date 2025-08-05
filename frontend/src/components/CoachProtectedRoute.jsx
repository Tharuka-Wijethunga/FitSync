import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CoachProtectedRoute = () => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If the user role is not 'coach', redirect them
  if (userRole && userRole !== 'coach') {
    return <Navigate to="/dashboard" replace />;
  }

  // Show a loading state while the role is being determined from the token
  if (!userRole) {
    return <p>Loading user data...</p>;
  }

  // If authenticated and role is 'coach', render the child route
  return <Outlet />;
};

export default CoachProtectedRoute;