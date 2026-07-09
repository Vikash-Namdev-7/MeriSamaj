import React, { useState, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Save, X, Activity, Shield, Settings, FileText, Smartphone, Bell, Layout, Download, Building2, Lock } from 'lucide-react';
import { PROFILE_TABS } from './utils/constants';

// Hooks
import { useProfileSettings } from './hooks/useProfileSettings';
import { useSecurity } from './hooks/useSecurity';
import { useNotificationSettings } from './hooks/useNotificationSettings';
import { useThemeSettings } from './hooks/useThemeSettings';

// Lazy loaded components for performance
const ProfileOverview = React.lazy(() => import('./components/ProfileOverview').then(m => ({ default: m.ProfileOverview })));
const PersonalInfo = React.lazy(() => import('./components/PersonalInfo').then(m => ({ default: m.PersonalInfo })));
const CommunityDetails = React.lazy(() => import('./components/CommunityDetails').then(m => ({ default: m.CommunityDetails })));
const SecurityCenter = React.lazy(() => import('./components/SecurityCenter').then(m => ({ default: m.SecurityCenter })));
const SessionManagement = React.lazy(() => import('./components/SessionManagement').then(m => ({ default: m.SessionManagement })));
const NotificationPreferences = React.lazy(() => import('./components/NotificationPreferences').then(m => ({ default: m.NotificationPreferences })));
const ThemePreferences = React.lazy(() => import('./components/ThemePreferences').then(m => ({ default: m.ThemePreferences })));
const DigitalIDCard = React.lazy(() => import('./components/DigitalIDCard').then(m => ({ default: m.DigitalIDCard })));
const ExportCenter = React.lazy(() => import('./components/ExportCenter').then(m => ({ default: m.ExportCenter })));
const AuditTimeline = React.lazy(() => import('./components/AuditTimeline').then(m => ({ default: m.AuditTimeline })));

export const HeadProfileSettings = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Hooks state
  const { profile, stats, loading: profileLoading, saving: profileSaving, unsavedChanges, handleChange, saveChanges, discardChanges, handleAvatarUpload, completionPercentage, missingFields } = useProfileSettings();
  const { sessions, auditLogs, loading: securityLoading, actionLoading, changePassword, toggle2FA, terminateSession } = useSecurity();
  const { preferences, saving: notifSaving, togglePreference, savePreferences: saveNotifs } = useNotificationSettings();
  const { themePrefs, saving: themeSaving, updatePreference: updateThemePref, savePreferences: saveTheme } = useThemeSettings();

  const loading = profileLoading || securityLoading;

  const getIconForTab = (tabId) => {
    switch (tabId) {
      case 'overview': return User;
      case 'personal': return FileText;
      case 'community': return Building2;
      case 'security': return Lock;
      case 'sessions': return Smartphone;
      case 'notifications': return Bell;
      case 'theme': return Layout;
      case 'digital_id': return Shield;
      case 'export': return Download;
      case 'audit': return Activity;
      default: return Settings;
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <ProfileOverview profile={profile} stats={stats} completionPercentage={completionPercentage} missingFields={missingFields} onAvatarUpload={handleAvatarUpload} />;
      case 'personal':
        return <PersonalInfo profile={profile} handleChange={handleChange} />;
      case 'community':
        return <CommunityDetails profile={profile} stats={stats} />;
      case 'security':
        return <SecurityCenter changePassword={changePassword} toggle2FA={toggle2FA} profile={profile} />;
      case 'sessions':
        return <SessionManagement sessions={sessions} terminateSession={terminateSession} />;
      case 'notifications':
        return <NotificationPreferences preferences={preferences} togglePreference={togglePreference} savePreferences={saveNotifs} saving={notifSaving} />;
      case 'theme':
        return <ThemePreferences themePrefs={themePrefs} updatePreference={updateThemePref} savePreferences={saveTheme} saving={themeSaving} />;
      case 'digital_id':
        return <DigitalIDCard profile={profile} />;
      case 'export':
        return <ExportCenter />;
      case 'audit':
        return <AuditTimeline logs={auditLogs} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin shadow-lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative enterprise-settings-wrapper bg-surface">
      
      {/* UNSAVED CHANGES BANNER */}
      <AnimatePresence>
        {unsavedChanges && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-50 m-4 px-6 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-xl shadow-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Save className="text-amber-500" size={20} />
              </div>
              <div>
                <h4 className="text-amber-600 font-bold text-sm tracking-wide">You have unsaved changes</h4>
                <p className="text-amber-600/70 text-xs">Please save your profile updates before leaving.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={discardChanges}
                className="px-4 py-2 rounded-xl border border-amber-500/30 text-amber-600 hover:bg-amber-500/10 text-xs font-bold transition-all"
              >
                Discard
              </button>
              <button 
                onClick={saveChanges}
                disabled={profileSaving}
                className="px-6 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                {profileSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT NAV */}
        <aside className="w-[280px] shrink-0 h-full overflow-y-auto no-scrollbar border-r border-gray-200 bg-white py-6 px-4 hidden md:block">
          <div className="mb-8 px-2">
            <h2 className="text-2xl font-black text-black tracking-tight flex items-center gap-2 mb-1">
              My Profile
            </h2>
            <p className="text-xs font-medium text-black uppercase tracking-widest">Account Settings</p>
          </div>

          <nav className="space-y-1.5">
            {PROFILE_TABS.map(tab => {
              const isActive = activeTab === tab.id;
              const Icon = getIconForTab(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group relative overflow-hidden ${
                    isActive ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' : 'text-black hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-black group-hover:text-brand-primary transition-colors'} />
                  <span className="text-black block">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* RIGHT CONTENT */}
        <main className="flex-1 h-full overflow-y-auto no-scrollbar relative">
          <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-full pb-32">
            
            {/* Mobile Tabs Dropdown (Visible only on mobile) */}
            <div className="md:hidden mb-6">
              <select 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-bold text-black shadow-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 appearance-none"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
              >
                {PROFILE_TABS.map(tab => (
                  <option key={tab.id} value={tab.id}>{tab.label}</option>
                ))}
              </select>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-black text-black mb-2">
                {PROFILE_TABS.find(t => t.id === activeTab)?.label}
              </h1>
              <p className="text-sm text-black font-medium">Manage your {PROFILE_TABS.find(t => t.id === activeTab)?.label.toLowerCase()} here.</p>
            </div>

            <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" /></div>}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderActiveTab()}
                </motion.div>
              </AnimatePresence>
            </Suspense>

          </div>
        </main>
      </div>
    </div>
  );
};

export default HeadProfileSettings;
