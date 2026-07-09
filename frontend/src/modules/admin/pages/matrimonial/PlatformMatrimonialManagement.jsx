import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, ShieldAlert, Flag, BarChart2, PieChart, Activity
} from 'lucide-react';

import { useGlobalMatrimonial } from './hooks/useGlobalMatrimonial';

// Lazy load components or import directly for now
import OverviewDashboard from './components/Dashboard/OverviewDashboard';
import ProfilesDirectory from './components/Directory/ProfilesDirectory';
import ModerationQueue from './components/Moderation/ModerationQueue';
import ReportsComplaints from './components/Reports/ReportsComplaints';
import MatchAnalytics from './components/Analytics/MatchAnalytics';
import CommunityComparison from './components/Comparison/CommunityComparison';
import AuditLogs from './components/Audit/AuditLogs';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, component: OverviewDashboard },
  { id: 'directory', label: 'Profiles Directory', icon: Users, component: ProfilesDirectory },
  { id: 'moderation', label: 'Moderation Queue', icon: ShieldAlert, component: ModerationQueue },
  { id: 'reports', label: 'Reports & Complaints', icon: Flag, component: ReportsComplaints },
  { id: 'analytics', label: 'Match Analytics', icon: BarChart2, component: MatchAnalytics },
  { id: 'comparison', label: 'Community Comparison', icon: PieChart, component: CommunityComparison },
  { id: 'audit', label: 'Audit Logs', icon: Activity, component: AuditLogs },
];

export const PlatformMatrimonialManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  
  const setActiveTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };
  const matrimonialData = useGlobalMatrimonial();
  const { loading, error } = matrimonialData;

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || OverviewDashboard;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
          <p className="text-gray-400 font-bold mt-4 animate-pulse">Loading Global Matrimonial Registry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-xl max-w-lg mx-auto mt-20">
        <h3 className="text-rose-400 font-bold mb-2">System Error</h3>
        <p className="text-gray-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Platform Matrimonial Management</h1>
          <p className="text-sm text-gray-400 mt-1">Global oversight and moderation of all community matrimonial profiles.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-white/10">
        <div className="flex space-x-1 p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold rounded-t-xl transition-all relative ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-brand-primary' : ''} />
                <span className="whitespace-nowrap">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="matrimonialTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ActiveComponent data={matrimonialData} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PlatformMatrimonialManagement;
