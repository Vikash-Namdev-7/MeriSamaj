import React from 'react';
import { ActivityCard } from '../components/ActivityCard'; // just a placeholder card for later, maybe not needed right now
// actually let's implement ActivityCard
export const ActivityCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className={`p-4 rounded-xl border border-gray-100 flex items-center gap-4 bg-white shadow-sm hover:shadow-md transition-shadow`}>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">{title}</p>
      <h4 className="text-[20px] font-black text-gray-800 leading-none mt-1">{value}</h4>
    </div>
  </div>
);
