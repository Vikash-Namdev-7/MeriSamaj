import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

const MemberProtectedRoute = () => {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth.isInitialized) {
    // You can replace this with a full-screen loading spinner
    return (
      <div className="h-screen w-full flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return auth.isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/member/login" state={{ from: location }} replace />
  );
};

export default MemberProtectedRoute;
