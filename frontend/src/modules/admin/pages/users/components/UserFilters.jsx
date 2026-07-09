import React from 'react';
import { Search, Filter, RefreshCcw } from 'lucide-react';

export const UserFilters = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters({
      searchQuery: '',
      status: 'All',
      community: 'All Communities',
      role: 'All Roles'
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4 relative z-10">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        {/* Search */}
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Global Search</label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              name="searchQuery"
              value={filters.searchQuery}
              onChange={handleChange}
              placeholder="Search by Name, ID, Phone, Email..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Account Status</label>
          <select 
            name="status" 
            value={filters.status}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
            <option value="Soft Deleted">Soft Deleted</option>
          </select>
        </div>

        {/* Community Filter */}
        <div className="w-full md:w-48">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Community</label>
          <select 
            name="community" 
            value={filters.community}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
          >
            <option value="All Communities">All Communities</option>
            <option value="Brahmin Samaj">Brahmin Samaj</option>
            <option value="Patidar Samaj">Patidar Samaj</option>
            <option value="Rajput Samaj">Rajput Samaj</option>
            <option value="Agarwal Samaj">Agarwal Samaj</option>
          </select>
        </div>

        {/* Reset Button */}
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 border border-transparent"
        >
          <RefreshCcw size={16} /> Reset
        </button>
      </div>
    </div>
  );
};
