import React from 'react';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, Clock, ShieldBan, UserPlus, Activity } from 'lucide-react';

export const UserAnalytics = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers ?? 0,
      icon: Users,
      color: 'from-indigo-500/15 to-blue-500/15',
      iconColor: 'text-indigo-500',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers ?? 0,
      icon: ShieldCheck,
      color: 'from-emerald-500/15 to-teal-500/15',
      iconColor: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Pending Verification',
      value: stats.pendingVerification ?? 0,
      icon: Clock,
      color: 'from-amber-500/15 to-orange-500/15',
      iconColor: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      title: 'Suspended',
      value: stats.suspendedUsers ?? 0,
      icon: Activity,
      color: 'from-orange-500/15 to-red-500/15',
      iconColor: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      title: 'Blocked',
      value: stats.blockedUsers ?? 0,
      icon: ShieldBan,
      color: 'from-rose-500/15 to-pink-500/15',
      iconColor: 'text-rose-500',
      bg: 'bg-rose-50',
    },
    {
      title: 'New This Month',
      value: stats.newUsersThisMonth ?? 0,
      icon: UserPlus,
      color: 'from-purple-500/15 to-violet-500/15',
      iconColor: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      title: 'Pending Complaints',
      value: stats.pendingComplaints ?? 0,
      icon: Clock,
      color: 'from-amber-500/15 to-yellow-500/15',
      iconColor: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Transfer Requests',
      value: stats.pendingTransfers ?? 0,
      icon: Activity,
      color: 'from-blue-500/15 to-cyan-500/15',
      iconColor: 'text-blue-500',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 shadow-sm`}
          >
            <div className={`absolute -right-6 -top-6 w-20 h-20 rounded-full bg-gradient-to-br ${card.color} blur-2xl`} />
            <div className={`w-9 h-9 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} className={card.iconColor} />
            </div>
            <p className="text-2xl font-black text-gray-900">{card.value.toLocaleString()}</p>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">{card.title}</p>
          </motion.div>
        );
      })}
    </div>
  );
};
