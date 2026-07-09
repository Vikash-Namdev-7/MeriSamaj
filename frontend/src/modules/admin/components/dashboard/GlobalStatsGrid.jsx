import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Building2, Wallet, Users2, ShieldAlert, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, color, bgClass, borderClass, delay }) => {
  const isPositive = trend > 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card-neo p-5 relative overflow-hidden group hover:border-purple-200 transition-all duration-300 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col justify-between min-h-[140px] cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className={`w-11 h-11 rounded-2xl ${bgClass} ${borderClass} border flex items-center justify-center`}>
          <Icon className={`w-5.5 h-5.5 ${color}`} />
        </div>
        
        <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
          isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
        }`}>
          <span>{isPositive ? '+' : ''}{trend}%</span>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">{title}</p>
        <h3 className="text-[26px] font-black text-slate-800 tracking-tight mt-1.5 leading-none">
          {value}
        </h3>
      </div>
    </motion.div>
  );
};

export const GlobalStatsGrid = ({ stats }) => {
  if (!stats) return null;
  
  const cards = [
    { 
      title: "Total Members", 
      value: typeof stats.totalMembers === 'number' && stats.totalMembers > 1000 ? (stats.totalMembers/1000).toFixed(1) + 'k' : stats.totalMembers, 
      icon: Users, 
      trend: 12.5, 
      color: "text-purple-600",
      bgClass: "bg-purple-50",
      borderClass: "border-purple-100/50"
    },
    { 
      title: "Active Communities", 
      value: stats.totalCommunities, 
      icon: Building2, 
      trend: 5.2, 
      color: "text-blue-600",
      bgClass: "bg-blue-50",
      borderClass: "border-blue-100/50"
    },
    { 
      title: "Total Revenue", 
      value: `₹${(stats.totalRevenue / 100000).toFixed(2)}L`, 
      icon: Wallet, 
      trend: 8.4, 
      color: "text-emerald-600",
      bgClass: "bg-emerald-50",
      borderClass: "border-emerald-100/50"
    },
    { 
      title: "Matrimonial Profiles", 
      value: stats.matrimonialProfiles, 
      icon: Users2, 
      trend: 15.2, 
      color: "text-rose-600",
      bgClass: "bg-rose-50",
      borderClass: "border-rose-100/50"
    },
    { 
      title: "Pending Approvals", 
      value: stats.pendingApprovals, 
      icon: ShieldAlert, 
      trend: -2.4, 
      color: "text-amber-600",
      bgClass: "bg-amber-50",
      borderClass: "border-amber-100/50"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <StatCard key={card.title} {...card} delay={index * 0.1} />
      ))}
    </div>
  );
};
