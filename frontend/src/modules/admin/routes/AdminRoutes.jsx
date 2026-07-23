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
import HeadDetailsPage from '../pages/community-heads/HeadDetailsPage';
import HeadActivityMonitor from '../pages/community-heads/HeadActivityMonitor';
import HeadReports from '../pages/community-heads/HeadReports';
import SubscriptionManagement from '../pages/subscriptions/SubscriptionManagement';
import GlobalFamilyManagement from '../pages/families/GlobalFamilyManagement';
import GlobalProfessionalOverview from '../pages/professionals/GlobalProfessionalOverview';
import GlobalProfessionalGrid from '../pages/professionals/GlobalProfessionalGrid';
import GlobalProfessionalApprovals from '../pages/professionals/GlobalProfessionalApprovals';
import GlobalProfessionalCategories from '../pages/professionals/GlobalProfessionalCategories';
import GlobalFundManagement from '../pages/fund/GlobalFundManagement';
import DonationManagement from '../../../pages/admin/DonationManagement';
import CommunitiesPage from '../pages/communities/CommunitiesPage';
import AdminLogin from '../pages/login/AdminLogin';

import CityFeedManagement from '../pages/social/CityFeedManagement';
import CommunityFeedManagement from '../pages/social/CommunityFeedManagement';
import AdminPostDetailsPage from '../pages/social/PostDetailsPage';
import { AdminGroupsPage } from '../pages/groups/AdminGroupsPage';
import SuccessStoriesManagement from '../pages/matrimonial/SuccessStoriesManagement';

export const AdminRoutes = () => {
  return (
    <Routes>
      {/* Public Admin Login Route */}
      <Route path="login" element={<AdminLogin />} />

      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          {/* Default /admin redirects to admin dashboard */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        
        {/* Admin Operational Dashboard */}
        <Route path="dashboard" element={<AdminDashboard />} />
        
        {/* Other Admin views */}
        <Route path="users" element={<UserManagement />} />
        <Route path="matrimonial" element={<PlatformMatrimonialManagement />} />
        <Route path="marketing/success-stories" element={<SuccessStoriesManagement />} />
        <Route path="events" element={<EventsDesk />} />
        <Route path="cities" element={<CityManagement />} />
        {/* Community Head Management */}
        <Route path="community-heads">
          <Route index element={<CommunityHeadManagement />} />
          <Route path="activity" element={<HeadActivityMonitor />} />
          <Route path="reports" element={<HeadReports />} />
          <Route path=":id" element={<HeadDetailsPage />} />
        </Route>
        <Route path="subscriptions" element={<SubscriptionManagement />} />
        <Route path="config" element={<SystemConfig />} />
        <Route path="families" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="professionals">
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<GlobalProfessionalOverview />} />
          <Route path="grid" element={<GlobalProfessionalGrid />} />
          <Route path="approvals" element={<GlobalProfessionalApprovals />} />
          <Route path="categories" element={<GlobalProfessionalCategories />} />
        </Route>
        <Route path="donations" element={<DonationManagement />} />
        <Route path="funds" element={<GlobalFundManagement />} />


        {/* 📱 Social Module Management */}
        <Route path="social">
          <Route path="city-feed" element={<CityFeedManagement />} />
          <Route path="community-feed" element={<CommunityFeedManagement />} />
          <Route path="post/:id" element={<AdminPostDetailsPage />} />
        </Route>

        {/* 🏛️ Multi-Community Management — Master Admin Core Feature */}
        <Route path="communities" element={<CommunitiesPage />} />
        
        {/* Global Groups */}
        <Route path="groups" element={<AdminGroupsPage />} />
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
