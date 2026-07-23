import { useState } from 'react';
import { Search, X, SlidersHorizontal, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchSection = ({
  searchQuery,
  setSearchQuery,
  openFilter,
  activeFilterCount,
  selectedCategory,
  selectedCity,
  categories,
  setSelectedCategory,
  setSelectedCity,
  clearAllApplied,
  isLoading
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : id;
  };

  return (
    <div className="w-full space-y-3">
      {/* Search Input & Filter Button Container */}
      <div className="flex items-center gap-2.5">
        <div
          className={`flex-1 h-[54px] rounded-2xl bg-white border px-4 flex items-center gap-3 transition-all shadow-xs ${
            isFocused
              ? 'border-indigo-600 ring-2 ring-indigo-600/10'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <Search className={`w-4.5 h-4.5 transition-colors shrink-0 ${isFocused ? 'text-indigo-600' : 'text-slate-400'}`} />

          <input
            type="text"
            placeholder="Search business, category, services..."
            value={searchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder-slate-400"
          />

          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchQuery('')}
                className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openFilter}
          disabled={isLoading}
          aria-label="Filter Options"
          className={`relative h-[54px] w-[54px] rounded-2xl flex items-center justify-center border transition-all shadow-xs shrink-0 ${
            activeFilterCount > 0
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/20'
              : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <SlidersHorizontal className="w-4.5 h-4.5 stroke-[2]" />

          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              {activeFilterCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* Active Filter Chips */}
      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 flex-wrap px-0.5 pt-0.5"
          >
            <span className="text-xs font-semibold text-slate-400">Active:</span>

            {selectedCategory !== 'All' && (
              <motion.span
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full"
              >
                {getCategoryName(selectedCategory)}
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="hover:text-indigo-900 transition-colors rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.span>
            )}

            {selectedCity !== 'All Cities' && (
              <motion.span
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full"
              >
                <MapPin className="w-3 h-3 text-indigo-600" />
                {selectedCity}
                <button
                  onClick={() => setSelectedCity('All Cities')}
                  className="hover:text-indigo-900 transition-colors rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.span>
            )}

            <button
              onClick={clearAllApplied}
              className="text-xs font-bold text-red-500 hover:text-red-600 hover:underline px-1 transition-all"
            >
              Clear All
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchSection;
