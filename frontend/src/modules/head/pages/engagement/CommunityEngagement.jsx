import React, { useState } from 'react';
import { useData } from '../../../member/context/DataProvider';
import { ENGAGEMENT_TABS } from './constants/engagementTabs';
import { Search, Filter, ShieldAlert } from 'lucide-react';

// Tab Components
import { EngagementDashboard } from './tabs/EngagementDashboard';
import { EngagementAnalytics } from './tabs/EngagementAnalytics';
import { CommunityTimeline } from './tabs/CommunityTimeline';
import { TopContributors } from './tabs/TopContributors';
import { InactiveMembers } from './tabs/InactiveMembers';
import { EventParticipation } from './tabs/EventParticipation';
import { DonationParticipation } from './tabs/DonationParticipation';
import { SocialEngagement } from './tabs/SocialEngagement';
import { MemberRecognition } from './tabs/MemberRecognition';
import { EngagementReports } from './tabs/EngagementReports';

export const CommunityEngagement = () => {
  const { currentUser } = useData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Validate Head Access
  if (!currentUser?.communityId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl shadow-sm border border-gray-100">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert size={32} className="text-rose-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-2">Access Denied</h2>
        <p className="text-gray-500 max-w-md">You must be logged in as a Community Head to access the engagement management module.</p>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard': return <EngagementDashboard />;
      case 'analytics': return <EngagementAnalytics />;
      case 'timeline': return <CommunityTimeline />;
      case 'contributors': return <TopContributors />;
      case 'inactive': return <InactiveMembers />;
      case 'events': return <EventParticipation />;
      case 'donations': return <DonationParticipation />;
      case 'social': return <SocialEngagement />;
      case 'recognition': return <MemberRecognition />;
      case 'reports': return <EngagementReports />;
      default: return <EngagementDashboard />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 lg:gap-8 pb-10">
      
      {/* LEFT NAVIGATION (Sticky on Desktop) */}
      <div className="md:w-64 shrink-0">
        <div className="sticky top-[88px] space-y-6">
          {/* Header Info */}
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Community Engagement</h1>
            <p className="text-sm font-medium text-gray-900 mt-1">Manage and monitor activity</p>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex flex-col space-y-1">
            {ENGAGEMENT_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left font-bold text-[13px] group ${
                    isActive 
                      ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
                      : 'text-gray-900 hover:bg-gray-100 hover:text-gray-900 border border-transparent hover:border-gray-200 hover:shadow-sm'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-gray-900 group-hover:text-brand-primary'} />
                  <span className={isActive ? 'text-white' : 'text-gray-900 group-hover:text-brand-primary'}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* MOBILE NAV (Horizontal Scroll) */}
      <div className="md:hidden -mx-4 px-4 overflow-x-auto no-scrollbar py-1 flex gap-2">
        {ENGAGEMENT_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 whitespace-nowrap font-bold text-[12px] shrink-0 ${
                isActive 
                  ? 'bg-brand-primary text-white shadow-sm' 
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white' : 'text-gray-900'} />
              <span className={isActive ? 'text-white' : 'text-gray-900'}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        {/* Global Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center z-10 sticky top-0 md:relative md:top-auto">
          <div className="relative w-full sm:w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900" />
            <input 
              type="text"
              placeholder="Search members, activities, reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all text-gray-900"
            />
          </div>
          
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-xl text-[13px] font-bold transition-colors border border-gray-200">
            <Filter size={16} /> Filters
          </button>
        </div>

        {/* Tab Content Rendering */}
        <div className="animate-fade-in pb-8">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default CommunityEngagement;
