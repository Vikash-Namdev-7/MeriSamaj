import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const GlobalNotifications = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="card-neo overflow-hidden flex flex-col h-full"
    >
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-white flex items-center gap-2">
            <Bell size={16} className="text-rose-400" />
            Global Notification Center
          </h2>
        </div>
        <button className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-brand-primary px-3 py-1.5 rounded-lg hover:bg-purple-600 shadow shadow-brand-primary/20 transition-all">
          <Send size={12} />
          Broadcast
        </button>
      </div>

      <div className="p-5 space-y-4">
        
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex gap-3">
          <div className="mt-0.5"><CheckCircle2 size={16} className="text-emerald-400" /></div>
          <div>
            <h4 className="text-[12px] font-bold text-white">System Maintenance Completed</h4>
            <p className="text-[10px] text-gray-400 mt-1">Successfully deployed v2.4.0 to all communities via push notifications.</p>
            <span className="text-[9px] font-bold text-gray-500 uppercase mt-2 block">Sent to 4,520 users</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
          <div className="mt-0.5"><AlertCircle size={16} className="text-amber-400" /></div>
          <div>
            <h4 className="text-[12px] font-bold text-white text-amber-100">Pending Approval Reminder</h4>
            <p className="text-[10px] text-amber-200/70 mt-1">Scheduled for delivery to 12 Council Heads regarding 85 pending verifications.</p>
            <span className="text-[9px] font-bold text-amber-500 uppercase mt-2 block">Scheduled for 18:00</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
