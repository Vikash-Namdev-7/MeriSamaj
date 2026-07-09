import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useData } from '../../../member/context/DataProvider';
import { ExportService } from './services/ExportService';

import { ReportsHeader } from './components/ReportsHeader';
import { ReportFilters } from './components/ReportFilters';
import { KpiGrid } from './components/KpiGrid';
import { 
  MemberAnalytics, 
  EventAnalytics, 
  MatrimonialAnalytics, 
  ProfessionalAnalytics, 
  EngagementAnalytics, 
  NotificationAnalytics,
  FamilyAnalytics,
  FundAnalytics
} from './components/AnalyticsSections';
import { ReportsAuditLog } from './components/ReportsAuditLog';
import { ExportModal, ScheduleReportModal, ReportGeneratorModal } from './components/Modals';

export const CommunityReports = () => {
  const { currentUser, members, events, matrimonialProfiles } = useData();
  
  // Data Scoping
  // ALL reports must strictly be scoped to the logged-in Community Head's assigned community.
  const myCommunityId = currentUser?.community || 'Agrawal Samaj Indore';
  
  const communityMembers = useMemo(() => 
    members.filter(m => m.community === myCommunityId || !m.community /* Fallback for mock data lacking community */)
  , [members, myCommunityId]);

  const communityEvents = useMemo(() => 
    events.filter(e => e.community === myCommunityId || !e.community)
  , [events, myCommunityId]);

  const communityMatrimonial = useMemo(() => 
    matrimonialProfiles.filter(p => p.community === myCommunityId || !p.community)
  , [matrimonialProfiles, myCommunityId]);

  // Modal States
  const [activeModal, setActiveModal] = useState(null); // 'export' | 'schedule' | 'generate'
  
  // Global States
  const [toast, setToast] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  // Mock Audit Logs
  const auditLogs = useMemo(() => [
    { action: 'Report Exported (PDF)', reportType: 'Member Report', filters: 'City: Indore', generatedBy: currentUser?.name || 'Head', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { action: 'Report Generated', reportType: 'Family Analytics', filters: 'None', generatedBy: currentUser?.name || 'Head', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { action: 'Report Scheduled (Weekly)', reportType: 'Donation Report', filters: 'Date: This Month', generatedBy: currentUser?.name || 'Head', timestamp: new Date(Date.now() - 172800000).toISOString() }
  ], [currentUser]);

  // Helper to show toasts
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // KPI Calculations
  const metrics = useMemo(() => {
    return {
      totalMembers: communityMembers.length,
      activeMembers: Math.floor(communityMembers.length * 0.88),
      pendingMembers: communityMembers.filter(m => !m.isVerified).length,
      activeEvents: communityEvents.length,
      matrimonialProfiles: communityMatrimonial.length,
      professionalListings: communityMembers.filter(m => m.profession).length,
      engagementScore: 92,
      notificationsSent: 1250
    };
  }, [communityMembers, communityEvents, communityMatrimonial]);

  // Actions
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API refetch
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Data refreshed successfully');
    }, 800);
  };

  const handleExport = async (format) => {
    try {
      await ExportService.exportReport(format, 'Community_Report', { metrics }, activeFilters);
      showToast(`Successfully exported report as ${format.toUpperCase()}`);
    } catch (e) {
      showToast('Export failed. Please try again.', 'error');
    }
  };

  const handleSchedule = async (scheduleData) => {
    try {
      await ExportService.scheduleReport(scheduleData);
      showToast('Report schedule saved successfully');
    } catch (e) {
      showToast('Failed to schedule report.', 'error');
    }
  };

  const handleGenerate = async (type) => {
    try {
      // Simulate report generation
      await new Promise(r => setTimeout(r, 1500));
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated!`);
    } catch (e) {
      showToast('Failed to generate report.', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-55 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border backdrop-blur-md ${
              toast.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-bold tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <ReportsHeader 
        currentUser={currentUser}
        onRefresh={handleRefresh}
        onGenerate={() => setActiveModal('generate')}
        onExport={() => setActiveModal('export')}
        onSchedule={() => setActiveModal('schedule')}
      />

      <ReportFilters onFilterChange={setActiveFilters} />

      {isRefreshing ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
           <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin mb-4" />
           <p className="text-brand-primary font-bold animate-pulse">Synchronizing Analytics...</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          <KpiGrid metrics={metrics} />
          
          <MemberAnalytics data={communityMembers} />
          
          <EventAnalytics data={communityEvents} />
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <MatrimonialAnalytics data={communityMatrimonial} />
            <ProfessionalAnalytics data={communityMembers} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <FamilyAnalytics data={communityMembers} />
            <FundAnalytics />
          </div>

          <EngagementAnalytics />
          
          <NotificationAnalytics />

          <ReportsAuditLog logs={auditLogs} />
        </motion.div>
      )}

      {/* Modals */}
      <ExportModal 
        isOpen={activeModal === 'export'} 
        onClose={() => setActiveModal(null)} 
        onExport={handleExport}
      />
      <ScheduleReportModal 
        isOpen={activeModal === 'schedule'} 
        onClose={() => setActiveModal(null)} 
        onSchedule={handleSchedule}
      />
      <ReportGeneratorModal 
        isOpen={activeModal === 'generate'} 
        onClose={() => setActiveModal(null)} 
        onGenerate={handleGenerate}
      />
    </div>
  );
};

export default CommunityReports;
