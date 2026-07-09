import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, TrendingUp, Calendar, Heart, Briefcase, Award, Send } from 'lucide-react';
import { Sparkline } from './ChartComponents';

export const KpiGrid = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <KpiCard 
        title="Total Members"
        value={metrics.totalMembers}
        icon={<Users size={20} />}
        color="purple"
        trend={+4.2}
        sparklineData={[10, 15, 25, 40, 50, 75, 100, 120, 150]}
      />
      <KpiCard 
        title="Active Members"
        value={metrics.activeMembers}
        icon={<UserCheck size={20} />}
        color="emerald"
        trend={+2.8}
        sparklineData={[40, 45, 40, 55, 60, 58, 65, 80, 85]}
      />
      <KpiCard 
        title="Pending Approvals"
        value={metrics.pendingMembers}
        icon={<TrendingUp size={20} />}
        color="rose"
        trend={-1.5}
        sparklineData={[15, 12, 18, 10, 8, 5, 2]}
      />
      <KpiCard 
        title="Active Events"
        value={metrics.activeEvents}
        icon={<Calendar size={20} />}
        color="indigo"
        trend={+12.0}
        sparklineData={[1, 2, 1, 3, 4, 2, 5]}
      />
      <KpiCard 
        title="Matrimonial Profiles"
        value={metrics.matrimonialProfiles}
        icon={<Heart size={20} />}
        color="pink"
        trend={+5.5}
        sparklineData={[20, 25, 30, 28, 35, 40, 45]}
      />
      <KpiCard 
        title="Professional Listings"
        value={metrics.professionalListings}
        icon={<Briefcase size={20} />}
        color="amber"
        trend={+8.1}
        sparklineData={[5, 10, 8, 15, 20, 22, 25]}
      />
      <KpiCard 
        title="Engagement Score"
        value={metrics.engagementScore + '%'}
        icon={<Award size={20} />}
        color="purple"
        trend={+1.2}
        sparklineData={[80, 82, 85, 88, 90, 92, 94]}
      />
      <KpiCard 
        title="Notifications Sent"
        value={metrics.notificationsSent}
        icon={<Send size={20} />}
        color="blue"
        trend={+15.4}
        sparklineData={[100, 150, 120, 200, 250, 300, 450]}
      />
    </div>
  );
};

const KpiCard = ({ title, value, icon, color, trend, sparklineData }) => {
  // Setup colors based on prop
  const colorMap = {
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', hex: '#8B5CF6' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', hex: '#10B981' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', hex: '#F43F5E' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600', hex: '#6366F1' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600', hex: '#EC4899' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', hex: '#F59E0B' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', hex: '#3B82F6' },
  };
  const theme = colorMap[color] || colorMap.purple;

  // Animated Counter
  const [displayValue, setDisplayValue] = useState(typeof value === 'string' ? value : 0);

  useEffect(() => {
    if (typeof value === 'number') {
      let start = 0;
      const end = value;
      if (start === end) {
        setDisplayValue(end);
        return;
      }
      let totalDuration = 1000;
      let incrementTime = (totalDuration / end);
      
      let timer = setInterval(() => {
        start += 1;
        setDisplayValue(start);
        if (start === end) clearInterval(timer);
      }, Math.max(10, incrementTime)); // at least 10ms

      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      className={`card-neo p-5 relative overflow-hidden group hover:${theme.border} transition-all duration-300 cursor-pointer`}
    >
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl ${theme.bg} border ${theme.border} flex items-center justify-center ${theme.text}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 font-bold text-xs px-2 py-1 rounded-full border ${trend >= 0 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-rose-700 bg-rose-50 border-rose-200'}`}>
          <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} />
          {trend >= 0 ? '+' : ''}{trend}%
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{title}</h4>
        <h3 className="text-3xl font-black text-gray-900 mt-1 tracking-tight">
          {displayValue}
        </h3>
      </div>

      <div className="h-10 mt-3 flex items-end opacity-60 group-hover:opacity-100 transition-opacity">
        <Sparkline data={sparklineData} color={theme.hex} width={150} height={30} />
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>vs last period</span>
        <span className={`${theme.text} font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform duration-200`}>
          Details
        </span>
      </div>
    </motion.div>
  );
};
