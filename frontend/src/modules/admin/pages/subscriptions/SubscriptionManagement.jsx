import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, CreditCard, Users, BarChart2, Wallet, 
  Ticket, FileText, Bell, Activity, Settings
} from 'lucide-react';

import { useSubscriptions } from '../../hooks/useSubscriptions';

// Dummy imports for now, we will create these in the next steps
import OverviewDashboard from './components/Overview/OverviewDashboard';
import PlanList from './components/Plans/PlanList';
import SubscribersTable from './components/Subscribers/SubscribersTable';
import UsageDashboard from './components/Usage/UsageDashboard';
import RevenueDashboard from './components/Revenue/RevenueDashboard';
import CouponManagement from './components/Coupons/CouponManagement';
import InvoiceTable from './components/Invoices/InvoiceTable';
import NotificationCenter from './components/Notifications/NotificationCenter';
import AuditCenter from './components/Audit/AuditCenter';
import SubscriptionSettings from './components/Settings/SubscriptionSettings';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, component: OverviewDashboard },
  { id: 'plans', label: 'Plans', icon: CreditCard, component: PlanList },
  { id: 'subscribers', label: 'Subscribers', icon: Users, component: SubscribersTable },
  { id: 'usage', label: 'Usage', icon: BarChart2, component: UsageDashboard },
  { id: 'revenue', label: 'Revenue', icon: Wallet, component: RevenueDashboard },
  { id: 'coupons', label: 'Coupons', icon: Ticket, component: CouponManagement },
  { id: 'invoices', label: 'Invoices', icon: FileText, component: InvoiceTable },
  { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationCenter },
  { id: 'audit', label: 'Audit', icon: Activity, component: AuditCenter },
  { id: 'settings', label: 'Settings', icon: Settings, component: SubscriptionSettings },
];

export const SubscriptionManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  
  const setActiveTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };
  const subscriptionData = useSubscriptions();
  const { loading, error } = subscriptionData;

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component || OverviewDashboard;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
          <p className="text-gray-400 font-bold mt-4 animate-pulse">Loading Enterprise Subscriptions...</p>
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
          <h1 className="text-2xl font-black text-white tracking-tight">Enterprise Subscription Management</h1>
          <p className="text-sm text-gray-400 mt-1">Manage global plans, pricing, and SaaS revenues across all communities.</p>
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
                    layoutId="activeTabIndicator"
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
            <ActiveComponent data={subscriptionData} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SubscriptionManagement;
