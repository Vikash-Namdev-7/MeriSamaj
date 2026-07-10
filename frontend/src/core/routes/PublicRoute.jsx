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

  const isOnboarded = auth.user?.name && auth.user.name !== 'Member';

  return auth.isAuthenticated ? (
    <Navigate to={isOnboarded ? "/member/home" : "/member/onboarding"} replace />
  ) : (
    <Outlet />
  );
};

export default PublicRoute;
