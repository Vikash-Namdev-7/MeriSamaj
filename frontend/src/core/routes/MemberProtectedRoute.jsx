import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

const MemberProtectedRoute = () => {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth.isInitialized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (auth.isAuthenticated) {
    const hasCommunity = !!(auth.user?.communityId);
    const isOnboardingPath = location.pathname.startsWith('/member/onboarding') || location.pathname.startsWith('/member/splash');
    
    // Redirect authenticated users without a community to the onboarding flow
    if (!hasCommunity && !isOnboardingPath) {
      return <Navigate to="/member/onboarding" replace />;
    }
    
    // If onboarding is complete, prevent navigating back to onboarding screen
    if (hasCommunity && location.pathname.startsWith('/member/onboarding')) {
      return <Navigate to="/member/home" replace />;
    }
    
    return <Outlet />;
  }

  return <Navigate to="/member/login" state={{ from: location }} replace />;
};

export default MemberProtectedRoute;
