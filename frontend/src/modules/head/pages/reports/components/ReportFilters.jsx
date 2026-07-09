import React, { useState, useEffect } from 'react';
import { Filter, X, Search, ChevronDown, MapPin, Users, Target } from 'lucide-react';

export const ReportFilters = ({ onFilterChange }) => {
  const [activeFilters, setActiveFilters] = useState({
    timeRange: 'Year to Date',
    area: 'All Areas',
    category: 'All Categories'
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ ...activeFilters, search: searchQuery });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, activeFilters, onFilterChange]);

  const handleFilterSelect = (key, value) => {
    const updated = { ...activeFilters, [key]: value };
    setActiveFilters(updated);
    onFilterChange({ ...updated, search: searchQuery });
  };

  const removeFilter = (key) => {
    const defaults = {
      timeRange: 'Year to Date',
      area: 'All Areas',
      category: 'All Categories'
    };
    handleFilterSelect(key, defaults[key]);
  };

  const hasActiveFilters = Object.entries(activeFilters).some(([key, val]) => {
    if (key === 'timeRange' && val !== 'Year to Date') return true;
    if (key === 'area' && val !== 'All Areas') return true;
    if (key === 'category' && val !== 'All Categories') return true;
    return false;
  });

  return (
    <div className="relative z-40 bg-surface/90 backdrop-blur-md pb-4 pt-2 -mx-4 px-4 md:-mx-8 md:px-8">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-4 rounded-2xl card-neo shadow-sm border border-gray-100">
        
        {/* Search & Base Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative group w-full md:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search reports or members..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-primary focus:bg-white transition-all shadow-sm"
            />
          </div>

          <div className="h-6 w-[1px] bg-gray-200 hidden md:block mx-1"></div>

          <FilterDropdown 
            icon={<Filter size={14} />} 
            label={activeFilters.timeRange} 
            options={['Today', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Quarter', 'Year to Date']}
            onSelect={(val) => handleFilterSelect('timeRange', val)}
          />
          <FilterDropdown 
            icon={<MapPin size={14} />} 
            label={activeFilters.area} 
            options={['All Areas', 'North Zone', 'South Zone', 'East Zone', 'West Zone']}
            onSelect={(val) => handleFilterSelect('area', val)}
          />
          <FilterDropdown 
            icon={<Target size={14} />} 
            label={activeFilters.category} 
            options={['All Categories', 'Members', 'Events', 'Matrimonial', 'Professionals']}
            onSelect={(val) => handleFilterSelect('category', val)}
          />
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 w-full md:w-auto">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mr-1">Active:</span>
            {activeFilters.timeRange !== 'Year to Date' && (
              <FilterChip label={activeFilters.timeRange} onRemove={() => removeFilter('timeRange')} />
            )}
            {activeFilters.area !== 'All Areas' && (
              <FilterChip label={activeFilters.area} onRemove={() => removeFilter('area')} />
            )}
            {activeFilters.category !== 'All Categories' && (
              <FilterChip label={activeFilters.category} onRemove={() => removeFilter('category')} />
            )}
          </div>
        )}

      </div>
    </div>
  );
};

// Sub-components
const FilterDropdown = ({ icon, label, options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative" 
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-xs transition-all shadow-sm"
      >
        <span style={{ color: '#000000' }}>{icon}</span>
        <span className="max-w-[100px] truncate" style={{ color: '#000000', fontWeight: 'bold' }}>{label}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{ color: '#000000' }} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-40 py-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 origin-top animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((opt) => (
            <button 
              key={opt}
              onClick={() => {
                onSelect(opt);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors"
              style={{ 
                color: label === opt ? '#7C3AED' : '#000000',
                fontWeight: label === opt ? 'bold' : 'normal'
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const FilterChip = ({ label, onRemove }) => (
  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-primary/20 border border-brand-primary/30 text-brand-primary text-[10px] font-bold">
    <span>{label}</span>
    <button onClick={onRemove} className="hover:bg-brand-primary/20 rounded-full p-0.5 transition-colors">
      <X size={10} />
    </button>
  </div>
);
