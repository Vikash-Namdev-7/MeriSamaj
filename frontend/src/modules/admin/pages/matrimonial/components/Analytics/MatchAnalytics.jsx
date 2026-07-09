import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, PieChart, TrendingUp, Users } from 'lucide-react';

export const MatchAnalytics = ({ data }) => {
  const { stats } = data;

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-white">Match & Demographics Analytics</h2>
          <p className="text-xs text-gray-400">Global insights into matrimonial trends and conversions</p>
        </div>
        <button className="btn-secondary py-1.5 px-4 text-xs">Download Report</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-neo p-5">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Registrations (MTD)</p>
          <h3 className="text-2xl font-black text-white mt-1">{stats.monthlyRegistrations}</h3>
          <div className="mt-2 flex items-center gap-1 text-emerald-400 text-xs font-bold">
            <TrendingUp size={14} /> +12%
          </div>
        </div>
        <div className="card-neo p-5">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Successful Matches</p>
          <h3 className="text-2xl font-black text-white mt-1">{stats.successfulMatches}</h3>
          <div className="mt-2 flex items-center gap-1 text-emerald-400 text-xs font-bold">
            <TrendingUp size={14} /> +5.4%
          </div>
        </div>
        <div className="card-neo p-5">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Avg Profile Completion</p>
          <h3 className="text-2xl font-black text-white mt-1">{stats.avgCompletion}%</h3>
        </div>
        <div className="card-neo p-5">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Hidden Profiles</p>
          <h3 className="text-2xl font-black text-white mt-1">{stats.hiddenProfiles}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-neo p-6 flex flex-col justify-center min-h-[300px]">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
            <Users size={16} className="text-brand-primary" /> Age Distribution (Global)
          </h3>
          <div className="flex items-end justify-between h-48 px-4 gap-2">
            {/* Mock Chart Bars */}
            {[
              { label: '18-24', height: '30%' },
              { label: '25-29', height: '80%' },
              { label: '30-34', height: '65%' },
              { label: '35-39', height: '40%' },
              { label: '40+', height: '15%' },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative flex items-end justify-center h-full bg-white/5 rounded-t-lg overflow-hidden border-b border-white/10">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: bar.height }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="w-full bg-indigo-500/80 group-hover:bg-indigo-400 transition-all rounded-t-lg"
                  ></motion.div>
                </div>
                <span className="text-[10px] text-gray-400 font-bold">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card-neo p-6 flex flex-col justify-center min-h-[300px]">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
            <PieChart size={16} className="text-brand-primary" /> Profession Distribution
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">Engineering & IT</span>
                <span className="text-white font-bold">35%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary" style={{ width: '35%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">Business / Self-Employed</span>
                <span className="text-white font-bold">28%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400" style={{ width: '28%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">Medical</span>
                <span className="text-white font-bold">15%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-rose-400" style={{ width: '15%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">Finance & Accounting (CA)</span>
                <span className="text-white font-bold">12%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400" style={{ width: '12%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">Others</span>
                <span className="text-white font-bold">10%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gray-500" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchAnalytics;
