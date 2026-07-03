// import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { MemberLayout } from '../components/layout/MemberLayout';
import { AnimatedPage } from '../components/layout/AnimatedPage';

// Onboarding
import SplashScreen from '../pages/onboarding/SplashScreen';
import LoginScreen from '../pages/onboarding/LoginScreen';
import RegisterScreen from '../pages/onboarding/RegisterScreen';
import OnboardingScreen from '../pages/onboarding/OnboardingScreen';

// Main Tab Pages
import HomePage from '../pages/home/HomePage';
// import FeedPage from '../pages/social/FeedPage';
import MatrimonialHomePage from '../pages/matrimonial/MatrimonialHomePage';
import DirectoryPage from '../pages/directory/DirectoryPage';
import MyProfilePage from '../pages/profile/MyProfilePage';

// Sub Pages
import EventsPage from '../pages/events/EventsPage';
// import GroupsPage from '../pages/groups/GroupsPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import SettingsPage from '../pages/settings/SettingsPage';

// Detail Pages (Built in Phase A)
import CreatePostPage from '../pages/social/CreatePostPage';
import PostDetailPage from '../pages/social/PostDetailPage';
import MemberDetailPage from '../pages/directory/MemberDetailPage';
import DirectoryListPage from '../pages/directory/DirectoryListPage';
import EventDetailPage from '../pages/events/EventDetailPage';
import ChatPage from '../pages/social/ChatPage';

// Phase B Pages
import GroupDetailPage from '../pages/groups/GroupDetailPage';
import SocialHubPage from '../pages/social/SocialHubPage';
import SocialInsightsPage from '../pages/social/SocialInsightsPage';
import MatrimonialProfilePage from '../pages/matrimonial/MatrimonialProfilePage';
import MatrimonialSetupPage from '../pages/matrimonial/MatrimonialSetupPage';
import InterestsPage from '../pages/matrimonial/InterestsPage';
import MatrimonialSearchPage from '../pages/matrimonial/MatrimonialSearchPage';
import MatrimonialShortlistPage from '../pages/matrimonial/MatrimonialShortlistPage';
import MatrimonialSuccessStories from '../pages/matrimonial/MatrimonialSuccessStories';
import { MatrimonialProvider } from '../pages/matrimonial/MatrimonialContext';
import MatrimonialChatPage from '../pages/matrimonial/MatrimonialChatPage';
import MatrimonialSubscriptionPage from '../pages/matrimonial/MatrimonialSubscriptionPage';
import EditProfilePage from '../pages/profile/EditProfilePage';
import FamilyPage from '../pages/profile/FamilyPage';
import VerifyMembershipPage from '../pages/profile/VerifyMembershipPage';
import UpgradeMembershipPage from '../pages/profile/UpgradeMembershipPage';
import ProfessionalDirectoryPage from '../pages/directory/ProfessionalDirectoryPage';
import ProfessionalDetailPage from '../pages/directory/ProfessionalDetailPage';
import ApplyProfessionalPage from '../pages/directory/ApplyProfessionalPage';
import VotingPage from '../pages/voting/VotingPage';
import PollDetailPage from '../pages/voting/PollDetailPage';
import ElectionsListPage from '../pages/voting/ElectionsListPage';
// import SurveysPage from '../pages/voting/SurveysPage';
import { VotingProvider } from '../pages/voting/VotingContext';
import DonationPage from '../pages/donation/DonationPage';
import DonateSetupPage from '../pages/donation/DonateSetupPage';
import DonatePaymentPage from '../pages/donation/DonatePaymentPage';
import DonateSuccessPage from '../pages/donation/DonateSuccessPage';
import MyDonationsPage from '../pages/donation/MyDonationsPage';
import DonationCampaignDetailPage from '../pages/donation/DonationCampaignDetailPage';
import { DonationProvider } from '../pages/donation/DonationContext';

// Referral & Rewards
import { ReferralProvider } from '../pages/referral/ReferralContext';
import ReferralDashboardPage from '../pages/referral/ReferralDashboardPage';
import MyEarningsPage from '../pages/referral/MyEarningsPage';
import RedeemPointsPage from '../pages/referral/RedeemPointsPage';

// Feature: Om Shanti (legacy)
import ObituaryPage from '../pages/obituary/ObituaryPage';
import CreateObituaryPage from '../pages/obituary/CreateObituaryPage';

// Feature: Shradhanjali (enhanced)
import ShradhanjaliHomePage from '../pages/obituary/ShradhanjaliHomePage';
import ShradhanjaliDetailPage from '../pages/obituary/ShradhanjaliDetailPage';
import CreateShradhanjaliPage from '../pages/obituary/CreateShradhanjaliPage';

// Dharmashala Booking Module
import DharmashalaHomePage from '../pages/dharmashala/DharmashalaHomePage';
import DharmashalaBookingPage from '../pages/dharmashala/DharmashalaBookingPage';
import MyBookingsPage from '../pages/dharmashala/MyBookingsPage';

// Samaj Fund Module
import FundListingPage from '../pages/fund/FundListingPage';
import FundTotalReportPage from '../pages/fund/FundTotalReportPage';
import FundDashboardPage from '../pages/fund/FundDashboardPage';
import IncomeSourcesPage from '../pages/fund/IncomeSourcesPage';
import ExpenseDetailsPage from '../pages/fund/ExpenseDetailsPage';
import MemberDuesListPage from '../pages/fund/MemberDuesListPage';
import FundMemberProfilePage from '../pages/fund/FundMemberProfilePage';
import FundHistoryPage from '../pages/fund/FundHistoryPage';
import FundReportPage from '../pages/fund/FundReportPage';

// Feature: Leadership
import LeadershipPage from '../pages/leadership/LeadershipPage';

// Feature: Census
import { CensusPage } from '../pages/census/CensusPage';

// Feature: Chat
// import ChatListPage from '../pages/chat/ChatListPage';
import ChatRouteWrapper from '../pages/chat/ChatRouteWrapper';
import ChatInfoPage from '../pages/chat/ChatInfoPage';

// Feature: Nimantran
import NimantranHomePage from '../pages/nimantran/NimantranHomePage';
import CreateNimantranPage from '../pages/nimantran/CreateNimantranPage';
import NimantranDetailPage from '../pages/nimantran/NimantranDetailPage';

export const MemberRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <ReferralProvider>
        <Routes location={location} key={location.pathname}>
          {/* Onboarding — no bottom nav */}
          <Route path="splash" element={<SplashScreen />} />
          <Route path="login" element={<LoginScreen />} />
          <Route path="register" element={<RegisterScreen />} />
          <Route path="onboarding" element={<OnboardingScreen />} />

          {/* Main App — with bottom nav */}
          <Route path="/" element={<MemberLayout />}>
            <Route index element={<Navigate to="home" replace />} />

            {/* Main Tabs */}
            <Route path="home" element={<AnimatedPage><HomePage /></AnimatedPage>} />
            <Route path="social" element={<AnimatedPage><SocialHubPage initialTab="feed" /></AnimatedPage>} />
            <Route path="social/insights" element={<AnimatedPage><SocialInsightsPage /></AnimatedPage>} />
            <Route path="matrimonial" element={<MatrimonialProvider />}>
              <Route index element={<AnimatedPage><MatrimonialHomePage /></AnimatedPage>} />
              <Route path="setup" element={<AnimatedPage><MatrimonialSetupPage /></AnimatedPage>} />
              <Route path="interests" element={<AnimatedPage><InterestsPage /></AnimatedPage>} />
              <Route path="search" element={<AnimatedPage><MatrimonialSearchPage /></AnimatedPage>} />
              <Route path="shortlist" element={<AnimatedPage><MatrimonialShortlistPage /></AnimatedPage>} />
              <Route path="stories" element={<AnimatedPage><MatrimonialSuccessStories /></AnimatedPage>} />
              <Route path=":profileId" element={<AnimatedPage><MatrimonialProfilePage /></AnimatedPage>} />
              <Route path="chat/:profileId" element={<AnimatedPage><MatrimonialChatPage /></AnimatedPage>} />
              <Route path="subscription" element={<AnimatedPage><MatrimonialSubscriptionPage /></AnimatedPage>} />
            </Route>
            <Route path="directory" element={<AnimatedPage><DirectoryPage /></AnimatedPage>} />
            <Route path="profile" element={<AnimatedPage><MyProfilePage /></AnimatedPage>} />

            {/* Sub Pages (bottom nav hidden via BottomNav logic) */}
            <Route path="settings" element={<AnimatedPage><SettingsPage /></AnimatedPage>} />
            <Route path="events" element={<AnimatedPage><EventsPage /></AnimatedPage>} />
            <Route path="events/:eventId" element={<AnimatedPage><EventDetailPage /></AnimatedPage>} />

            {/* Groups base route mapped to SocialHub */}
            <Route path="groups" element={<AnimatedPage><SocialHubPage initialTab="groups" /></AnimatedPage>} />
            <Route path="groups/:groupId" element={<AnimatedPage><GroupDetailPage /></AnimatedPage>} />

            <Route path="social/create" element={<AnimatedPage><CreatePostPage /></AnimatedPage>} />
            <Route path="social/:postId" element={<AnimatedPage><PostDetailPage /></AnimatedPage>} />

            <Route path="directory/list" element={<AnimatedPage><DirectoryListPage /></AnimatedPage>} />
            <Route path="directory/:memberId" element={<AnimatedPage><MemberDetailPage /></AnimatedPage>} />
            <Route path="chat/:memberId" element={<AnimatedPage><ChatRouteWrapper /></AnimatedPage>} />

            <Route path="profile/edit" element={<AnimatedPage><EditProfilePage /></AnimatedPage>} />
            <Route path="profile/family" element={<AnimatedPage><FamilyPage /></AnimatedPage>} />
            <Route path="profile/verify" element={<AnimatedPage><VerifyMembershipPage /></AnimatedPage>} />
            <Route path="profile/upgrade" element={<AnimatedPage><UpgradeMembershipPage /></AnimatedPage>} />

            <Route path="professional" element={<AnimatedPage><ProfessionalDirectoryPage /></AnimatedPage>} />
            <Route path="professional/:id" element={<AnimatedPage><ProfessionalDetailPage /></AnimatedPage>} />
            <Route path="professional/apply" element={<AnimatedPage><ApplyProfessionalPage /></AnimatedPage>} />

            <Route path="voting" element={<VotingProvider />}>
              <Route index element={<AnimatedPage><VotingPage /></AnimatedPage>} />
              <Route path="list" element={<AnimatedPage><ElectionsListPage /></AnimatedPage>} />
              <Route path=":id" element={<AnimatedPage><PollDetailPage /></AnimatedPage>} />
            </Route>

            <Route path="donation" element={<DonationProvider />}>
              <Route index element={<AnimatedPage><DonationPage /></AnimatedPage>} />
              <Route path="setup" element={<AnimatedPage><DonateSetupPage /></AnimatedPage>} />
              <Route path="payment" element={<AnimatedPage><DonatePaymentPage /></AnimatedPage>} />
              <Route path="success" element={<AnimatedPage><DonateSuccessPage /></AnimatedPage>} />
              <Route path="my" element={<AnimatedPage><MyDonationsPage /></AnimatedPage>} />
              <Route path="campaign/:id" element={<AnimatedPage><DonationCampaignDetailPage /></AnimatedPage>} />
            </Route>

            <Route path="notifications" element={<AnimatedPage><NotificationsPage /></AnimatedPage>} />

          <Route path="leadership" element={<AnimatedPage><LeadershipPage /></AnimatedPage>} />
          <Route path="census" element={<AnimatedPage><CensusPage /></AnimatedPage>} />

          {/* Chat base route mapped to SocialHub */}
          <Route path="chat" element={<AnimatedPage><SocialHubPage initialTab="chat" /></AnimatedPage>} />
          <Route path="chat/:chatId" element={<AnimatedPage><ChatRouteWrapper /></AnimatedPage>} />
          <Route path="chat/info/:chatId" element={<AnimatedPage><ChatInfoPage /></AnimatedPage>} />

          <Route path="obituaries" element={<AnimatedPage><ObituaryPage /></AnimatedPage>} />
          <Route path="obituaries/create" element={<AnimatedPage><CreateObituaryPage /></AnimatedPage>} />

          {/* Shradhanjali — Full-featured memorial module */}
          <Route path="shradhanjali" element={<AnimatedPage><ShradhanjaliHomePage /></AnimatedPage>} />
          <Route path="shradhanjali/create" element={<AnimatedPage><CreateShradhanjaliPage /></AnimatedPage>} />
          <Route path="shradhanjali/:id" element={<AnimatedPage><ShradhanjaliDetailPage /></AnimatedPage>} />

          {/* Nimantran Module */}
          <Route path="nimantran" element={<AnimatedPage><NimantranHomePage /></AnimatedPage>} />
          <Route path="nimantran/create" element={<AnimatedPage><CreateNimantranPage /></AnimatedPage>} />
          <Route path="nimantran/:id" element={<AnimatedPage><NimantranDetailPage /></AnimatedPage>} />

          {/* Dharmashala Booking Module */}
          <Route path="dharmashala" element={<AnimatedPage><DharmashalaHomePage /></AnimatedPage>} />
          <Route path="dharmashala/bookings" element={<AnimatedPage><MyBookingsPage /></AnimatedPage>} />
          <Route path="dharmashala/:id" element={<AnimatedPage><DharmashalaBookingPage /></AnimatedPage>} />

          {/* Samaj Fund Module */}
          <Route path="fund" element={<AnimatedPage><FundListingPage /></AnimatedPage>} />
          <Route path="fund/total-report" element={<AnimatedPage><FundTotalReportPage /></AnimatedPage>} />
          <Route path="fund/:fundId" element={<AnimatedPage><FundDashboardPage /></AnimatedPage>} />
          <Route path="fund/:fundId/income" element={<AnimatedPage><IncomeSourcesPage /></AnimatedPage>} />
          <Route path="fund/:fundId/expense" element={<AnimatedPage><ExpenseDetailsPage /></AnimatedPage>} />
          <Route path="fund/:fundId/dues" element={<AnimatedPage><MemberDuesListPage /></AnimatedPage>} />
          <Route path="fund/:fundId/member/:id" element={<AnimatedPage><FundMemberProfilePage /></AnimatedPage>} />
          <Route path="fund/:fundId/history" element={<AnimatedPage><FundHistoryPage /></AnimatedPage>} />
          <Route path="fund/:fundId/report" element={<AnimatedPage><FundReportPage /></AnimatedPage>} />

          {/* Referral module */}
          <Route path="referral" element={<AnimatedPage><ReferralDashboardPage /></AnimatedPage>} />
          <Route path="referral/earnings" element={<AnimatedPage><MyEarningsPage /></AnimatedPage>} />
          <Route path="referral/redeem" element={<AnimatedPage><RedeemPointsPage /></AnimatedPage>} />

          {/* Catch-all for missing phase B pages */}
          <Route path="*" element={<div className="flex flex-col items-center justify-center min-h-[60vh]"><p className="text-gray-400 text-sm">Feature coming soon (Phase B)</p></div>} />
        </Route>
      </Routes>
      </ReferralProvider>
    </AnimatePresence>
  );
};
