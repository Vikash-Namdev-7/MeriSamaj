import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock } from 'lucide-react';

export const ActivityTimeline = () => {
  const activities = [
    { id: 1, type: 'registration', user: 'Ramesh Desai', desc: 'Registered a new matrimonial profile', time: '10 mins ago', color: 'bg-pink-500' },
    { id: 2, type: 'donation', user: 'Sneha Patel', desc: 'Donated ₹5,000 to Education Fund', time: '25 mins ago', color: 'bg-emerald-500' },
    { id: 3, type: 'admin', user: 'Manish Jain', desc: 'Approved 15 new member verifications', time: '1 hour ago', color: 'bg-brand-primary' },
    { id: 4, type: 'event', user: 'System', desc: 'Published "Navratri Mahotsav 2026" event', time: '3 hours ago', color: 'bg-amber-500' },
    { id: 5, type: 'complaint', user: 'Anonymous', desc: 'Raised a ticket regarding login issues', time: '5 hours ago', color: 'bg-rose-500' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="card-neo overflow-hidden flex flex-col h-full"
    >
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-sm font-black text-white flex items-center gap-2">
          <Activity size={16} className="text-emerald-400" />
          Live Platform Activity
        </h2>
      </div>

      <div className="p-5 overflow-y-auto flex-1">
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
          {activities.map((item, index) => (
            <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#1e1e2d] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${item.color}`}>
                <Clock size={14} className="text-white" />
              </div>

              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-[12px] font-bold text-white">{item.user}</h4>
                  <time className="text-[9px] font-bold text-gray-500">{item.time}</time>
                </div>
                <p className="text-[11px] text-gray-400">{item.desc}</p>
              </div>

            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
