import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HeadLayout from '../components/HeadLayout';
import HeadDashboard from '../pages/dashboard/HeadDashboard';
import MemberManagement from '../pages/members/MemberManagement';
import FundGovernance from '../pages/funds/FundGovernance';
import ElectionCommission from '../pages/elections/ElectionCommission';
import OfficialCirculars from '../pages/announcements/OfficialCirculars';
import CommunitySettings from '../pages/settings/CommunitySettings';
import HomepageContentManager from '../pages/home/HomepageContentManager';
import EventManagement from '../pages/events/EventManagement';
import ProfessionalDirectoryManagement from '../pages/professionals/ProfessionalDirectoryManagement';
import HeadProfessionalCategories from '../pages/professionals/HeadProfessionalCategories';
import NotificationManagement from '../pages/notifications/NotificationManagement';
import MatrimonialManagement from '../pages/matrimonial/MatrimonialManagement';
import CommunityReports from '../pages/reports/CommunityReports';
import CommunityEngagement from '../pages/engagement/CommunityEngagement';
import InvitationManagement from '../pages/invitation/InvitationManagement';
import DonationManagement from '../pages/donation/DonationManagement';
import ObituaryManagement from '../pages/obituary/ObituaryManagement';
import DharmashalaManagement from '../pages/dharmashala/DharmashalaManagement';
import HeadProtectedRoute from '../components/HeadProtectedRoute';
import HeadProfileSettings from '../pages/profile/HeadProfileSettings';
import HeadLoginPage from '../pages/login/HeadLoginPage';

export const HeadRoutes = () => {
  return (
    <Routes>
      {/* ── Public Route: Head Login ── */}
      <Route path="login" element={<HeadLoginPage />} />

      {/* ── Protected Routes: require Head authentication ── */}
      <Route element={<HeadProtectedRoute />}>
        <Route element={<HeadLayout />}>
          {/* Default /head → dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* Head Dashboard */}
          <Route path="dashboard" element={<HeadDashboard />} />

          {/* Member Management Desk */}
          <Route path="members" element={<MemberManagement />} />

          {/* Other Head views */}
          <Route path="events" element={<EventManagement />} />
          <Route path="professionals">
            <Route index element={<ProfessionalDirectoryManagement />} />
            <Route path="categories" element={<HeadProfessionalCategories />} />
          </Route>
          <Route path="invitations" element={<InvitationManagement />} />
          <Route path="donations" element={<DonationManagement />} />
          <Route path="obituaries" element={<ObituaryManagement />} />
          <Route path="dharmashala" element={<DharmashalaManagement />} />
          <Route path="notifications" element={<NotificationManagement />} />
          <Route path="matrimonial" element={<MatrimonialManagement />} />
          <Route path="funds" element={<FundGovernance />} />
          <Route path="elections" element={<ElectionCommission />} />
          <Route path="announcements" element={<OfficialCirculars />} />
          <Route path="home-content" element={<HomepageContentManager />} />
          <Route path="settings" element={<CommunitySettings />} />
          <Route path="reports" element={<CommunityReports />} />
          <Route path="engagement" element={<CommunityEngagement />} />
          <Route path="profile" element={<HeadProfileSettings />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default HeadRoutes;
