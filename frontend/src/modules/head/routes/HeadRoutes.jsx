import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HeadLayout from '../components/HeadLayout';
import HeadDashboard from '../pages/dashboard/HeadDashboard';
import MemberManagement from '../pages/members/MemberManagement';
import FundGovernance from '../pages/funds/FundGovernance';
import ElectionCommission from '../pages/elections/ElectionCommission';
import OfficialCirculars from '../pages/announcements/OfficialCirculars';
import CommunitySettings from '../pages/settings/CommunitySettings';
import EventManagement from '../pages/events/EventManagement';
import ProfessionalDirectoryManagement from '../pages/professionals/ProfessionalDirectoryManagement';
import NotificationManagement from '../pages/notifications/NotificationManagement';
import MatrimonialManagement from '../pages/matrimonial/MatrimonialManagement';
import CommunityReports from '../pages/reports/CommunityReports';
import CommunityEngagement from '../pages/engagement/CommunityEngagement';
import InvitationManagement from '../pages/invitation/InvitationManagement';
import DonationManagement from '../pages/donation/DonationManagement';
import HeadProtectedRoute from '../components/HeadProtectedRoute';
import HeadProfileSettings from '../pages/profile/HeadProfileSettings';

export const HeadRoutes = () => {
  return (
    <Routes>
      <Route element={<HeadProtectedRoute />}>
        <Route element={<HeadLayout />}>
          {/* Default /head redirects to dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        
        {/* Head Dashboard */}
        <Route path="dashboard" element={<HeadDashboard />} />
        
        {/* Member Management Desk */}
        <Route path="members" element={<MemberManagement />} />
        
        {/* Other Head views */}
        <Route path="events" element={<EventManagement />} />
        <Route path="professionals" element={<ProfessionalDirectoryManagement />} />
        <Route path="invitations" element={<InvitationManagement />} />
        <Route path="donations" element={<DonationManagement />} />
        <Route path="notifications" element={<NotificationManagement />} />
        <Route path="matrimonial" element={<MatrimonialManagement />} />
        <Route path="funds" element={<FundGovernance />} />
        <Route path="elections" element={<ElectionCommission />} />
        <Route path="announcements" element={<OfficialCirculars />} />
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
