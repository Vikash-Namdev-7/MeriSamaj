import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminProtectedRoute from '../components/AdminProtectedRoute';
import AdminLayout from '../components/AdminLayout';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import UserManagement from '../pages/users/UserManagement';
import PlatformMatrimonialManagement from '../pages/matrimonial/PlatformMatrimonialManagement';
import EventsDesk from '../pages/events/EventsDesk';
import SystemConfig from '../pages/config/SystemConfig';
import CityManagement from '../pages/cities/CityManagement';
import CommunityHeadManagement from '../pages/community-heads/CommunityHeadManagement';
import SubscriptionManagement from '../pages/subscriptions/SubscriptionManagement';
import ContentManagementSystem from '../pages/cms/ContentManagementSystem';
import GlobalFamilyManagement from '../pages/families/GlobalFamilyManagement';
import GlobalProfessionalDirectory from '../pages/professionals/GlobalProfessionalDirectory';
import GlobalDonationManagement from '../pages/donations/GlobalDonationManagement';
import GlobalApprovalWorkflowCenter from '../pages/approvals/GlobalApprovalWorkflowCenter';
import GlobalAnnouncementCenter from '../pages/announcements/GlobalAnnouncementCenter';

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          {/* Default /admin redirects to admin dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
        
        {/* Admin Operational Dashboard */}
        <Route path="dashboard" element={<AdminDashboard />} />
        
        {/* Other Admin views */}
        <Route path="users" element={<UserManagement />} />
        <Route path="matrimonial" element={<PlatformMatrimonialManagement />} />
        <Route path="events" element={<EventsDesk />} />
        <Route path="cities" element={<CityManagement />} />
        <Route path="community-heads" element={<CommunityHeadManagement />} />
        <Route path="subscriptions" element={<SubscriptionManagement />} />
        <Route path="config" element={<SystemConfig />} />
        <Route path="cms" element={<ContentManagementSystem />} />
        <Route path="families" element={<GlobalFamilyManagement />} />
        <Route path="professionals" element={<GlobalProfessionalDirectory />} />
        <Route path="donations" element={<GlobalDonationManagement />} />
        <Route path="approvals" element={<GlobalApprovalWorkflowCenter />} />
        <Route path="announcements" element={<GlobalAnnouncementCenter />} />
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
