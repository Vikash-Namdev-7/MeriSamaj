import React from 'react';
import { Database, Users, Calendar, Megaphone } from 'lucide-react';

const UsageCard = ({ title, used, limit, icon: Icon, color }) => {
  const percentage = limit === 'unlimited' ? 25 : Math.min(100, Math.round((parseInt(used) / parseInt(limit)) * 100)) || 0;
  
  return (
    <div className="card-neo p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center ${color}`}>
            <Icon size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{title}</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Platform Average</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-white">{used}</p>
          <p className="text-xs text-gray-500">/ {limit}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Usage capacity</span>
          <span className="text-white font-medium">{limit === 'unlimited' ? 'N/A' : `${percentage}%`}</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${
              percentage > 90 ? 'bg-rose-500' : percentage > 75 ? 'bg-amber-500' : 'bg-brand-primary'
            }`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export const UsageDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">Platform Usage & Limits</h2>
        <p className="text-xs text-gray-400">Monitor resource consumption across all communities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <UsageCard title="Storage" used="840 GB" limit="2000 GB" icon={Database} color="text-indigo-400" />
        <UsageCard title="Members" used="45.2k" limit="100k" icon={Users} color="text-emerald-400" />
        <UsageCard title="Events" used="1,240" limit="unlimited" icon={Calendar} color="text-pink-400" />
        <UsageCard title="Broadcasts" used="8.5k" limit="20k" icon={Megaphone} color="text-amber-400" />
      </div>

      <div className="card-neo p-8 flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-300 mb-2">Detailed Usage Analytics</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">Visual charts for API requests, media storage growth, and bandwidth consumption will appear here.</p>
          <button className="btn-secondary py-2 px-6">Configure Usage Alerts</button>
        </div>
      </div>
    </div>
  );
};

export default UsageDashboard;
