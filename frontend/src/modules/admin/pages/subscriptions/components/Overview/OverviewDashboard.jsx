import React from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, Users, ShieldAlert, Wallet, TrendingUp, Activity
} from 'lucide-react';

const OverviewCard = ({ title, value, icon: Icon, trend, color, delay }) => {
  const isPositive = trend > 0;
  
  return (
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
      
      <div className="mt-4 flex items-center gap-2">
        <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {isPositive ? '+' : ''}{trend}%
        </div>
        <span className="text-[10px] text-gray-500 font-medium">vs last month</span>
      </div>
    </motion.div>
  );
};

export const OverviewDashboard = ({ data }) => {
  const { stats } = data;
  if (!stats) return null;

  const cards = [
    { title: "Total Plans", value: stats.totalPlans, icon: CreditCard, trend: 0, color: "text-brand-primary" },
    { title: "Active Subscribers", value: stats.activeSubscribers, icon: Users, trend: 5.2, color: "text-indigo-400" },
    { title: "Expired Subscribers", value: stats.expiredSubscribers, icon: ShieldAlert, trend: -1.2, color: "text-rose-400" },
    { title: "Monthly Revenue (MRR)", value: `₹${(stats.mrr / 1000).toFixed(1)}k`, icon: Wallet, trend: 8.4, color: "text-emerald-400" },
    { title: "Annual Revenue (ARR)", value: `₹${(stats.arr / 100000).toFixed(1)}L`, icon: TrendingUp, trend: 12.1, color: "text-emerald-400" },
    { title: "Renewal Rate", value: `${stats.renewalRate}%`, icon: Activity, trend: 1.5, color: "text-brand-primary" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <OverviewCard key={card.title} {...card} delay={index * 0.1} />
        ))}
      </div>
      
      {/* Mock Chart Area */}
      <div className="card-neo p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Revenue Growth</h3>
            <p className="text-xs text-gray-400">MRR & ARR over the last 6 months</p>
          </div>
          <button className="btn-secondary py-1.5 px-3 text-xs">Download Report</button>
        </div>
        <div className="h-64 w-full flex items-end gap-2">
          {/* Simple CSS bars for mock chart */}
          {stats.revenueTrend?.map((pt, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="w-full relative flex items-end justify-center h-48 bg-white/5 rounded-t-lg overflow-hidden">
                <div 
                  className="w-full bg-brand-primary/80 group-hover:bg-brand-primary transition-all rounded-t-lg"
                  style={{ height: `${(pt.revenue / 500000) * 100}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase">{pt.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewDashboard;
