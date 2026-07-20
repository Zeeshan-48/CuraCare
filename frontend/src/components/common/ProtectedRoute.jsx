import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useToast } from '../ui/Toast.jsx';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();
  const { showToast } = useToast();

  if (!isAuthenticated) {
    // Redirect to login but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Show toast and redirect unauthorized user to Home
    // We run the toast in a microtask/setTimeout to prevent React render loop warnings
    setTimeout(() => {
      showToast('You are not authorized to access this page.', 'error');
    }, 0);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
