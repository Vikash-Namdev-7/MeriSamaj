import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Clock, Activity, ShieldBan } from 'lucide-react';

export const UserAnalytics = ({ stats }) => {
  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20'
    },
    {
      title: 'Verified Members',
      value: stats.verifiedUsers,
      icon: UserCheck,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    {
      title: 'Pending Verification',
      value: stats.pendingVerification,
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
    {
      title: 'Online Now',
      value: stats.onlineUsers,
      icon: Activity,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, idx) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`p-5 rounded-2xl border ${stat.border} ${stat.bg} backdrop-blur-md relative overflow-hidden group`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 group-hover:rotate-12">
            <stat.icon size={64} className={stat.color} />
          </div>
          <div className="relative z-10">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} mb-3`}>
              <stat.icon size={20} />
            </div>
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">
              {stat.title}
            </p>
            <h3 className="text-3xl font-black text-gray-800">
              {stat.value.toLocaleString()}
            </h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
