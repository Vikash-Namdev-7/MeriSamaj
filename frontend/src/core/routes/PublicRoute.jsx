import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

const PublicRoute = () => {
  const { auth } = useAuth();

  if (!auth.isInitialized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return auth.isAuthenticated ? (
    <Navigate to="/member/home" replace />
  ) : (
    <Outlet />
  );
};

export default PublicRoute;
