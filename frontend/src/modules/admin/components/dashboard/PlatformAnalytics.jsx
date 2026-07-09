import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

export const PlatformAnalytics = () => {
  // Simple CSS-based bar chart representation
  const data = [
    { label: 'Jan', val: 40 },
    { label: 'Feb', val: 65 },
    { label: 'Mar', val: 55 },
    { label: 'Apr', val: 85 },
    { label: 'May', val: 70 },
    { label: 'Jun', val: 95 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      className="card-neo p-5 flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-black text-white flex items-center gap-2">
            <BarChart3 size={16} className="text-pink-400" />
            Growth Analytics
          </h2>
          <p className="text-[11px] text-text-muted mt-0.5">Platform adoption over last 6 months</p>
        </div>
      </div>

      <div className="flex-1 flex items-end gap-3 h-[180px] mt-4 pt-4 border-b border-white/10 relative">
        {/* Y Axis Guides */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
          {[100, 75, 50, 25, 0].map(step => (
            <div key={step} className="w-full border-t border-white/5 flex items-center justify-start h-0">
              <span className="text-[9px] text-gray-600 -mt-2 -ml-2 bg-[#1e1e2d] pr-1">{step}k</span>
            </div>
          ))}
        </div>

        {/* Bars */}
        <div className="w-full h-full flex items-end justify-between pl-6 pb-0 relative z-10">
          {data.map((d, i) => (
            <div key={i} className="flex flex-col items-center w-full group">
              <div 
                className="w-8 sm:w-12 bg-gradient-to-t from-pink-600/50 to-pink-400/80 rounded-t-sm group-hover:from-pink-500 group-hover:to-pink-300 transition-colors relative"
                style={{ height: `${d.val}%` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-white text-black text-[9px] font-bold px-1.5 py-0.5 rounded transition-opacity">
                  {d.val}k
                </div>
              </div>
              <span className="text-[10px] text-gray-400 font-medium mt-3">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
