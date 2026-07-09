import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Download, Upload, Plus, CalendarRange, IndianRupee, Share2, 
  CheckCircle2, Sliders, Search, Award, TrendingUp
} from 'lucide-react';
import { useUserManagement } from '../../hooks/useUserManagement';
import { UserAnalytics } from './components/UserAnalytics';
import { UserFilters } from './components/UserFilters';
import { UserTable } from './components/UserTable';
import { UserProfileDrawer } from './components/UserProfileDrawer';

const TABS = [
  { id: 'list', label: 'All Users', icon: Users },
  { id: 'bookings', label: 'User Bookings', icon: CalendarRange },
  { id: 'analytics', label: 'User Analytics', icon: TrendingUp },
  { id: 'referrals', label: 'Referral Settings', icon: Share2 }
];

const UserBookingsView = () => {
  const bookings = [
    { id: 'BK-1082', user: 'Vikash Namdev', resource: 'Dharmashala Hall A (AC)', date: 'Jul 10, 2026', range: 'Jul 15 - Jul 17', amount: '₹10,000', status: 'Confirmed' },
    { id: 'BK-1081', user: 'Rahul Sharma', resource: 'Suite Room 102', date: 'Jul 09, 2026', range: 'Jul 12 - Jul 14', amount: '₹3,600', status: 'Pending' },
    { id: 'BK-1080', user: 'Amit Patel', resource: 'Standard Room 205', date: 'Jul 08, 2026', range: 'Jul 08 - Jul 10', amount: '₹2,400', status: 'Checked-out' },
    { id: 'BK-1079', user: 'Priya Gupta', resource: 'Dharmashala Hall A (AC)', date: 'Jul 05, 2026', range: 'Aug 01 - Aug 02', amount: '₹5,000', status: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      {/* Mini Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', val: '124 Reserv.', color: 'border-purple-500/20 text-purple-600 bg-purple-500/5' },
          { label: 'Confirmed Res.', val: '86 Bookings', color: 'border-emerald-500/20 text-emerald-600 bg-emerald-500/5' },
          { label: 'Active Revenue', val: '₹1,45,200', color: 'border-brand-primary/20 text-brand-primary bg-brand-primary/5' },
          { label: 'Cancellations', val: '12 Cancel.', color: 'border-rose-500/20 text-rose-600 bg-rose-500/5' },
        ].map((stat, i) => (
          <div key={i} className={`p-4 border rounded-2xl flex flex-col justify-between ${stat.color}`}>
            <span className="text-[10px] font-black uppercase tracking-wider opacity-80">{stat.label}</span>
            <span className="text-xl font-black mt-1">{stat.val}</span>
          </div>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-black text-gray-900">Platform Bookings Registry</h3>
          <div className="flex items-center gap-2">
            <input type="text" placeholder="Search booking ID..." className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:bg-white focus:border-brand-primary transition-all w-40 text-gray-800" />
            <button className="px-3 py-1.5 bg-brand-primary text-white font-bold text-xs rounded-xl hover:bg-brand-primary/95 transition-all shadow-sm">Search</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                {['Booking ID', 'Member', 'Resource', 'Booking Date', 'Reservation Dates', 'Amount', 'Status'].map((h, i) => (
                  <th key={i} className="px-6 py-3.5 text-[10px] font-black uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {bookings.map((bk) => (
                <tr key={bk.id} className="hover:bg-gray-50/50 transition-all">
                  <td className="px-6 py-4 font-bold text-gray-900">{bk.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-[10px]">
                        {bk.user[0]}
                      </div>
                      <span className="font-semibold text-gray-800">{bk.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">{bk.resource}</td>
                  <td className="px-6 py-4 text-gray-500">{bk.date}</td>
                  <td className="px-6 py-4 text-gray-700 font-medium">{bk.range}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{bk.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      bk.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' :
                      bk.status === 'Pending' ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20' :
                      bk.status === 'Checked-out' ? 'bg-blue-500/10 text-blue-700 border border-blue-500/20' :
                      'bg-rose-500/10 text-rose-700 border border-rose-500/20'
                    }`}>
                      {bk.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ReferralSettingsView = () => {
  const [refBonus, setRefBonus] = useState('200');
  const [refereeBonus, setRefereeBonus] = useState('100');
  const [programEnabled, setProgramEnabled] = useState(true);

  const topReferrers = [
    { name: 'Vikash Namdev', count: 48, earned: '₹9,600' },
    { name: 'Pradeep Rathore', count: 32, earned: '₹6,400' },
    { name: 'Jyoti Namdev', count: 25, earned: '₹5,000' },
    { name: 'Sanjay Namdev', count: 18, earned: '₹3,600' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Settings Form */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-6">
        <div>
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
            <Sliders size={16} className="text-brand-primary" />
            Referral Program Configurations
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">Configure global reward triggers, referral bonuses, and program status.</p>
        </div>

        <div className="space-y-4">
          {/* Toggle */}
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100/50 transition-all text-xs font-bold text-gray-800">
            <div className="flex flex-col">
              <span>Enable Referral Program</span>
              <span className="text-[10px] text-gray-400 font-medium">Turn on/off referral rewards program globally</span>
            </div>
            <input 
              type="checkbox" 
              checked={programEnabled}
              onChange={() => setProgramEnabled(!programEnabled)}
              className="w-4.5 h-4.5 text-purple-600 rounded bg-white/5 border-gray-300 accent-purple-600 cursor-pointer"
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Referrer Reward (INR)</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={refBonus}
                  onChange={(e) => setRefBonus(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-brand-primary text-xs font-semibold text-gray-800"
                />
                <IndianRupee size={12} className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Referee Reward (INR)</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={refereeBonus}
                  onChange={(e) => setRefereeBonus(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-brand-primary text-xs font-semibold text-gray-800"
                />
                <IndianRupee size={12} className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Minimum Payout threshold</label>
              <input 
                type="text" 
                defaultValue="₹500"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-brand-primary text-xs font-semibold text-gray-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Max Invites Per User</label>
              <input 
                type="number" 
                defaultValue="20"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-brand-primary text-xs font-semibold text-gray-800"
              />
            </div>
          </div>
        </div>

        <button className="px-5 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-2xl hover:bg-brand-primary/95 transition-all shadow shadow-brand-primary/20">
          Save Settings
        </button>
      </div>

      {/* Leaderboard */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
            <Award size={16} className="text-brand-primary" />
            Top Referrers
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">Community leaders with maximum referrals.</p>
        </div>

        <div className="space-y-3.5">
          {topReferrers.map((ref, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-brand-primary/10 transition-colors">
              <div className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[9px] ${
                  idx === 0 ? 'bg-amber-100 text-amber-700' :
                  idx === 1 ? 'bg-slate-200 text-slate-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  #{idx + 1}
                </span>
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-none">{ref.name}</p>
                  <p className="text-[10px] text-gray-400 mt-1 leading-none">{ref.count} invites verified</p>
                </div>
              </div>
              <span className="text-xs font-black text-brand-primary">{ref.earned}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const UserManagement = () => {
  const { 
    users, stats, loading, error, 
    filters, setFilters, 
    handleUpdateStatus, handleVerifyUser 
  } = useUserManagement();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'list';

  const setActiveTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const [selectedUser, setSelectedUser] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleVerifyFromDrawer = async (userId) => {
    const success = await handleVerifyUser(userId);
    if (success && selectedUser?.id === userId) {
      setSelectedUser(prev => ({ ...prev, isVerified: true, verificationStatus: 'Verified', accountStatus: 'Active' }));
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
          <p className="text-gray-400 font-bold mt-4 animate-pulse">Loading Global User Data...</p>
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
      
      {/* ─── PAGE HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 pt-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
              <Users size={24} />
            </div>
            Global User Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Centralized control center for all platform users across all communities.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-gray-700 hover:bg-gray-50 transition-all text-sm font-bold border border-gray-200">
            <Upload size={16} /> Import
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-gray-700 hover:bg-gray-50 transition-all text-sm font-bold border border-gray-200">
            <Download size={16} /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 transition-all text-sm font-bold shadow-lg shadow-brand-primary/25">
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-gray-200">
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
                    ? 'text-brand-primary font-black' 
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-brand-primary' : ''} />
                <span className="whitespace-nowrap">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="userTabIndicator"
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
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'list' && (
              <div className="space-y-6">
                {/* ─── FILTERS ─── */}
                <UserFilters filters={filters} setFilters={setFilters} />

                {/* ─── DATA TABLE ─── */}
                <UserTable 
                  users={users} 
                  onStatusChange={handleUpdateStatus} 
                  onViewProfile={handleViewProfile}
                />
              </div>
            )}

            {activeTab === 'bookings' && <UserBookingsView />}

            {activeTab === 'analytics' && <UserAnalytics stats={stats} />}

            {activeTab === 'referrals' && <ReferralSettingsView />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── PROFILE DRAWER ─── */}
      <UserProfileDrawer 
        user={selectedUser} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        onVerify={handleVerifyFromDrawer}
      />

    </div>
  );
};

export default UserManagement;
