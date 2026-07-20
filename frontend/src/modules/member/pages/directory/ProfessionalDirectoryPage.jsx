import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, Star, CheckCircle, X,
  SlidersHorizontal, MapPin, AlertCircle
} from 'lucide-react';
import * as Icons from 'lucide-react';
import useProfessionalDirectory from '../../hooks/useProfessionalDirectory';
import { useData } from '../../context/DataProvider';

const SkeletonCard = () => (
  <div className="bg-card rounded-2xl p-4 border border-gray-100 flex items-center justify-between shadow-sm animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-gray-200 shrink-0" />
      <div className="space-y-2">
        <div className="h-3 w-32 bg-gray-200 rounded-full" />
        <div className="h-2 w-20 bg-gray-100 rounded-full" />
        <div className="h-2 w-14 bg-gray-100 rounded-full" />
      </div>
    </div>
    <div className="h-7 w-16 bg-gray-200 rounded-full" />
  </div>
);

const ProfessionalDirectoryPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useData();

  const { listings, categories, cities, isLoading, error } = useProfessionalDirectory(
    currentUser?.communityId || 'default'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const [tempCategory, setTempCategory] = useState('All');
  const [tempCity, setTempCity] = useState('All Cities');

  const openFilter = () => {
    setTempCategory(selectedCategory);
    setTempCity(selectedCity);
    setShowFilterPanel(true);
  };

  const applyFilters = () => {
    setSelectedCategory(tempCategory);
    setSelectedCity(tempCity);
    setShowFilterPanel(false);
  };

  const clearFilters = () => {
    setTempCategory('All');
    setTempCity('All Cities');
  };

  const clearAllApplied = () => {
    setSelectedCategory('All');
    setSelectedCity('All Cities');
  };

  const activeFilterCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedCity !== 'All Cities' ? 1 : 0);

  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.city.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (selectedCategory !== 'All' && item.categoryKey !== selectedCategory) return false;
      if (selectedCity !== 'All Cities' && item.city !== selectedCity) return false;
      return true;
    });
  }, [listings, searchQuery, selectedCategory, selectedCity]);

  return (
    <div className="min-h-screen bg-surface pb-16">

      {/* Header */}
      <div className="bg-card border-b border-gray-100 flex items-center justify-between px-4 h-14 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full hover:bg-gray-100 press-scale transition-colors">
            <ArrowLeft size={22} className="text-gray-800" />
          </button>
          <h1 className="text-[17px] font-black text-gray-900 tracking-tight leading-none">Professional Directory</h1>
        </div>
        <button
          onClick={() => navigate('/member/professional/apply')}
          className="text-[11px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-full press-scale shadow-sm"
        >
          Add Business
        </button>
      </div>

      <div className="px-4 pt-5 max-w-4xl mx-auto space-y-6">

        {/* Search + Filter */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center bg-white rounded-2xl px-4 py-3.5 gap-2.5 border border-gray-100 shadow-sm focus-within:border-indigo-600 transition-colors">
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search business or category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm font-semibold text-gray-800 flex-1 outline-none placeholder-gray-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X size={16} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <button
            onClick={openFilter}
            disabled={isLoading}
            className={`relative p-3.5 rounded-2xl border flex items-center justify-center press-scale shadow-sm transition-all ${
              activeFilterCount > 0
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-600/20'
                : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <SlidersHorizontal size={18} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {selectedCategory !== 'All' && (
              <span className="flex items-center gap-1.5 text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-full shadow-sm">
                {categories.find(c => c.id === selectedCategory)?.name || selectedCategory}
                <button onClick={() => setSelectedCategory('All')} className="hover:text-indigo-900 transition-colors">
                  <X size={12} />
                </button>
              </span>
            )}
            {selectedCity !== 'All Cities' && (
              <span className="flex items-center gap-1.5 text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-full shadow-sm">
                <MapPin size={11} /> {selectedCity}
                <button onClick={() => setSelectedCity('All Cities')} className="hover:text-indigo-900 transition-colors">
                  <X size={12} />
                </button>
              </span>
            )}
            <button onClick={clearAllApplied} className="text-[11px] font-black text-red-500 hover:text-red-600 px-2">
              Clear All
            </button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <AlertCircle size={20} className="text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-black text-red-700">Failed to load data</p>
              <p className="text-xs font-semibold text-red-500 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Categories Section */}
        {!error && (
          <div className="space-y-3">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider block ml-1">Categories</label>
            {isLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-[76px] bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {categories.map(cat => {
                  const IconComp = Icons[cat.iconName] || Icons.Briefcase;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(isSelected ? 'All' : cat.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all press-scale ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : `${cat.color} hover:shadow-sm`
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mb-1.5 ${isSelected ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                        <IconComp size={16} />
                      </div>
                      <span className={`text-[10px] font-black truncate w-full text-center ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Listings Section */}
        {!error && (
          <div className="space-y-3">
            <div className="flex items-center justify-between ml-1 mr-1">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                {isLoading ? 'Loading...' : `${filteredListings.length} Businesses Found`}
              </label>
              {activeFilterCount > 0 && !isLoading && (
                <button onClick={clearAllApplied} className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 transition-colors">
                  View All →
                </button>
              )}
            </div>

            <div className="space-y-3">
              {isLoading ? (
                [1, 2, 3].map(i => <SkeletonCard key={i} />)
              ) : filteredListings.length > 0 ? (
                filteredListings.map(biz => (
                  <div
                    key={biz.id}
                    onClick={() => navigate(`/member/professional/${biz.id}`)}
                    className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-indigo-200 transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-between group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      {biz.logo ? (
                        <img
                          src={biz.logo}
                          alt={biz.title}
                          className="w-14 h-14 rounded-xl object-cover border border-gray-100 shadow-sm shrink-0"
                        />
                      ) : (
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-lg shadow-sm shrink-0 ${biz.color}`}>
                          {biz.initials}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[14px] font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{biz.title}</span>
                          {biz.verified && (
                            <CheckCircle size={14} className="text-emerald-500 fill-emerald-50" />
                          )}
                        </div>
                        <p className="text-[11px] font-bold text-gray-500 mt-0.5">
                          {biz.category} · {biz.city}
                        </p>
                        <div className="flex items-center gap-1 text-amber-500 mt-1.5 bg-amber-50 w-fit px-1.5 py-0.5 rounded-md border border-amber-100">
                          <Star size={10} fill="currentColor" />
                          <span className="text-[10px] font-black text-amber-700">{biz.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                      <ArrowLeft size={16} className="rotate-135" style={{ transform: 'rotate(135deg)' }} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-3xl py-12 px-4 text-center border border-gray-100 shadow-sm">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search size={24} className="text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-800 font-black">No Businesses Found</p>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Try adjusting your filters</p>
                  <button
                    onClick={clearAllApplied}
                    className="mt-4 text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-5 py-2.5 rounded-full press-scale"
                  >
                    View All
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── FILTER BOTTOM SHEET ─────────────────────────────────────────────── */}
      {showFilterPanel && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center animate-fade-in backdrop-blur-sm"
          onClick={() => setShowFilterPanel(false)}
        >
          <div
            className="bg-white rounded-t-[32px] max-w-lg w-full shadow-2xl animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-4" />

            <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                  <SlidersHorizontal size={16} className="text-indigo-600" />
                </div>
                <h3 className="text-[17px] font-black text-gray-900">Filters</h3>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={clearFilters} className="text-[12px] font-black text-red-500 hover:text-red-600 transition-colors">
                  Clear
                </button>
                <button
                  onClick={() => setShowFilterPanel(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-6 max-h-[60vh] overflow-y-auto">

              {/* Category Filter */}
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-3">Category</p>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setTempCategory('All')}
                    className={`px-4 py-2.5 rounded-xl text-[13px] font-black border transition-all shadow-sm ${
                      tempCategory === 'All'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-600/20'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setTempCategory(tempCategory === cat.id ? 'All' : cat.id)}
                      className={`px-4 py-2.5 rounded-xl text-[13px] font-black border transition-all shadow-sm ${
                        tempCategory === cat.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-600/20'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* City Filter */}
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <MapPin size={12} /> City
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {cities.map(city => (
                    <button
                      key={city}
                      onClick={() => setTempCity(city)}
                      className={`px-4 py-2.5 rounded-xl text-[13px] font-black border transition-all shadow-sm ${
                        tempCity === city
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-600/20'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-5 border-t border-gray-100 pb-safe">
              <button
                onClick={applyFilters}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[15px] font-black shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform flex justify-center items-center gap-2"
              >
                Apply Filters {(tempCategory !== 'All' || tempCity !== 'All Cities') ? <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs">{(tempCategory !== 'All' ? 1 : 0) + (tempCity !== 'All Cities' ? 1 : 0)}</span> : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalDirectoryPage;

