import React from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { GlobalStatsGrid } from '../../components/dashboard/GlobalStatsGrid';
import { CommunityOverview } from '../../components/dashboard/CommunityOverview';
import { CommunityHealthCard } from '../../components/dashboard/CommunityHealthCard';
import { HeadControlCenter } from '../../components/dashboard/HeadControlCenter';
import { PlatformAnalytics } from '../../components/dashboard/PlatformAnalytics';
import { RevenueDashboard } from '../../components/dashboard/RevenueDashboard';
import { ActivityTimeline } from '../../components/dashboard/ActivityTimeline';
import { SystemHealth } from '../../components/dashboard/SystemHealth';
import { GlobalNotifications } from '../../components/dashboard/GlobalNotifications';
import { AuditLogs } from '../../components/dashboard/AuditLogs';
import { QuickAccessGrid } from '../../components/dashboard/QuickAccessGrid';
import { PlatformInsights } from '../../components/dashboard/PlatformInsights';

export const AdminDashboard = () => {
  const { 
    stats, 
    communities, 
    heads, 
    auditLogs, 
    systemHealth, 
    loading, 
    error 
  } = useDashboard();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
          <p className="text-gray-400 font-bold mt-4 animate-pulse">Initializing Master Console...</p>
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
    <div className="space-y-6 pb-20">
      
      {/* ─── STICKY DASHBOARD HEADER ─── */}
      <DashboardHeader />

      {/* ─── GLOBAL KPI DASHBOARD ─── */}
      <GlobalStatsGrid stats={stats} />

      {/* ─── PLATFORM HEALTH & REVENUE ROW ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PlatformAnalytics />
        </div>
        <div className="lg:col-span-1">
          <RevenueDashboard />
        </div>
      </div>

      {/* ─── COMMUNITIES & HEALTH ROW ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <CommunityOverview communities={communities} />
        </div>
        <div className="xl:col-span-1">
          <CommunityHealthCard />
        </div>
      </div>

      {/* ─── CONTROL CENTER & TIMELINE ROW ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HeadControlCenter heads={heads} />
        <ActivityTimeline />
      </div>

      {/* ─── INSIGHTS & INFRA ROW ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SystemHealth health={systemHealth} />
        </div>
        <div className="lg:col-span-1">
          <PlatformInsights />
        </div>
        <div className="lg:col-span-1">
          <GlobalNotifications />
        </div>
      </div>

      {/* ─── BOTTOM ROW: AUDIT & QUICK ACCESS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AuditLogs logs={auditLogs} />
        </div>
        <div className="lg:col-span-1">
          <QuickAccessGrid />
        </div>
      </div>

    </div>
  );
};

// Also export as MasterAdminDashboard for semantic mapping if needed anywhere
export const MasterAdminDashboard = AdminDashboard;
export default AdminDashboard;
