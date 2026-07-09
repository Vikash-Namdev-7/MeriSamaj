import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const MetricCard = ({ title, value, prefix, suffix, growth, icon: Icon, colorClass }) => {
  const isPositive = growth >= 0;
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150 ${colorClass}`} />
      
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${colorClass}`}>
          <Icon size={20} />
        </div>
        {growth !== undefined && (
          <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(growth)}%
          </div>
        )}
      </div>

      <p className="text-[13px] font-medium text-gray-500">{title}</p>
      <div className="mt-1 flex items-baseline gap-1">
        {prefix && <span className="text-lg font-bold text-gray-400">{prefix}</span>}
        <h3 className="text-2xl font-black text-gray-800 tracking-tight">{value?.toLocaleString() || 0}</h3>
        {suffix && <span className="text-sm font-bold text-gray-400">{suffix}</span>}
      </div>
    </div>
  );
};
