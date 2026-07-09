import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, CheckCircle2, ShieldAlert, Heart, TrendingUp, Activity, Flag
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="card-neo p-5 relative overflow-hidden group hover:border-brand-primary/30 transition-all duration-300"
  >
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${color} opacity-5 group-hover:opacity-10 transition-opacity blur-2xl`}></div>
    
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-white mt-1.5">{value}</h3>
      </div>
      <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
    </div>
  </motion.div>
);

export const OverviewDashboard = ({ data }) => {
  const { stats } = data;
  if (!stats) return null;

  const cards = [
    { title: "Total Profiles", value: stats.totalProfiles, icon: Users, color: "text-brand-primary" },
    { title: "Active Profiles", value: stats.activeProfiles, icon: Activity, color: "text-indigo-400" },
    { title: "Pending Reviews", value: stats.pendingReviews, icon: ShieldAlert, color: "text-amber-400" },
    { title: "Reported Profiles", value: stats.reportedProfiles, icon: Flag, color: "text-rose-400" },
    { title: "Successful Matches", value: stats.successfulMatches, icon: Heart, color: "text-pink-400" },
    { title: "Avg Completion", value: `${stats.avgCompletion}%`, icon: CheckCircle2, color: "text-emerald-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <StatCard key={card.title} {...card} delay={index * 0.1} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-neo p-6">
          <h3 className="text-lg font-bold text-white mb-6">Gender Distribution</h3>
          <div className="flex items-center gap-6">
            <div className="flex-1 flex flex-col items-center">
              <div className="text-3xl font-black text-blue-400 mb-2">{stats.genderRatio.male}%</div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Male (Grooms)</p>
            </div>
            <div className="w-px h-16 bg-white/10"></div>
            <div className="flex-1 flex flex-col items-center">
              <div className="text-3xl font-black text-pink-400 mb-2">{stats.genderRatio.female}%</div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Female (Brides)</p>
            </div>
          </div>
        </div>
        
        <div className="card-neo p-6">
          <h3 className="text-lg font-bold text-white mb-6">Top Communities</h3>
          <div className="space-y-4">
            {stats.topCommunities.map((c, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">{c.name}</span>
                  <span className="text-white font-bold">{c.count} Profiles</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary" style={{ width: `${(c.count / 5000) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewDashboard;
