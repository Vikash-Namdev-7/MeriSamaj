import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

export const CityFilters = ({ 
  searchQuery, 
  setSearchQuery, 
  filterStatus, 
  setFilterStatus,
  onReset 
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
      {/* Global Search */}
      <div className="relative flex-1 w-full">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by City, State, or Code..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-brand-primary transition-colors shadow-sm"
        />
      </div>

      {/* Advanced Filters */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-none">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-secondary" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 appearance-none focus:outline-none focus:border-brand-primary transition-colors shadow-sm"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>

        <button 
          onClick={onReset}
          className="p-2.5 rounded-xl bg-white border border-gray-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all flex items-center justify-center shrink-0 shadow-sm"
          title="Reset Filters"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
};
