import React from 'react';
import { Outlet } from 'react-router-dom';

export const AdminProtectedRoute = () => {
  return <Outlet />;
};

export default AdminProtectedRoute;
