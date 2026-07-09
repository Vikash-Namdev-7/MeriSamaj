import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useData } from '../../member/context/DataProvider';

export const HeadProtectedRoute = () => {
  const { currentUser } = useData();
  const location = useLocation();

  // Route protection logic
  if (!currentUser) {
    // Not logged in, redirect to login page
    return <Navigate to="/member/login" state={{ from: location }} replace />;
  }

  // Prevent Master Admin from accessing this route
  if (currentUser?.role === 'master_admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};

export default HeadProtectedRoute;
