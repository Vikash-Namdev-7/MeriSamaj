import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, AlertTriangle, Clock, Activity, ShieldCheck } from 'lucide-react';

export const DashboardCards = ({ stats }) => {
  if (!stats) return null;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const cards = [
    {
      title: 'Total Heads',
      value: stats.totalHeads,
      icon: Users,
      color: 'from-blue-500/20 to-indigo-500/20',
      iconColor: 'text-indigo-400'
    },
    {
      title: 'Active Heads',
      value: stats.activeHeads,
      icon: ShieldCheck,
      color: 'from-emerald-500/20 to-teal-500/20',
      iconColor: 'text-emerald-400'
    },
    {
      title: 'Suspended',
      value: stats.suspendedHeads,
      icon: AlertTriangle,
      color: 'from-rose-500/20 to-pink-500/20',
      iconColor: 'text-rose-400'
    },
    {
      title: 'Assigned Communities',
      value: stats.communitiesAssigned,
      icon: Building2,
      color: 'from-purple-500/20 to-fuchsia-500/20',
      iconColor: 'text-purple-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: idx * 0.1 }}
          className="card-neo p-4 flex flex-col justify-between group hover:bg-white/[0.03] transition-colors overflow-hidden relative"
        >
          {/* Animated Background Glow */}
          <div className={`absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-gradient-to-br ${card.color} blur-2xl group-hover:scale-150 transition-transform duration-500`} />
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 ${card.iconColor}`}>
              <card.icon size={16} />
            </div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-[28px] font-black text-white leading-none tracking-tight">
              {card.value}
            </h3>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-2">
              {card.title}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
