import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, X, Check, SlidersHorizontal, Sliders } from 'lucide-react';
import { useMatrimonial } from './MatrimonialContext';

const MatrimonialSearchPage = () => {
  const navigate = useNavigate();
  const { setActiveDiscoveryTab, setSearchFilters } = useMatrimonial();

  const [filters, setFilters] = useState({
    lookingFor: 'Female',
    minAge: 21,
    maxAge: 35,
    minHeight: "5'0\"",
    maxHeight: "6'0\"",
    gotra: 'All',
    manglik: 'All',
    maritalStatus: 'All',
    diet: 'All',
    city: 'All',
    photoOnly: false,
    onlineOnly: false,
    verifiedOnly: false,
  });

  const [savedSearches, setSavedSearches] = useState([
    { id: '1', name: 'Delhi Veg Garg Profiles', criteria: { diet: 'Vegetarian', gotra: 'Garg', city: 'Delhi' } },
    { id: '2', name: 'Software Engineers near me', criteria: { city: 'Bangalore' } }
  ]);

  const handleApply = () => {
    setSearchFilters(filters);
    navigate('/member/matrimonial');
  };

  const loadSavedSearch = (criteria) => {
    setFilters(prev => ({ ...prev, ...criteria }));
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[13.5px] font-bold text-slate-800 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-200 transition-all appearance-none";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 h-14 flex items-center gap-3 sticky top-0 z-30 shadow-sm shrink-0">
        <button onClick={() => navigate(-1)} className="p-1 active:opacity-60">
          <ArrowLeft size={22} className="text-slate-800" />
        </button>
        <div>
          <h1 className="text-[17px] font-black text-slate-800 leading-none">Search Matches</h1>
          <p className="text-[10px] font-bold text-rose-500 mt-0.5">Find your perfect companion</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <h3 className="text-[12px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sliders size={13} className="text-rose-500" /> Saved Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {savedSearches.map(search => (
                <button
                  key={search.id}
                  onClick={() => loadSavedSearch(search.criteria)}
                  className="bg-rose-50/50 hover:bg-rose-50 text-rose-600 border border-rose-100 text-[12px] font-bold px-3 py-2 rounded-xl transition-all"
                >
                  {search.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Basic Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-4">
          <h3 className="text-[12px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <SlidersHorizontal size={13} className="text-rose-500" /> Search Criteria
          </h3>

          {/* Looking For */}
          <div>
            <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Looking For</label>
            <div className="flex gap-2">
              {['Female', 'Male'].map(gender => (
                <button
                  key={gender}
                  onClick={() => setFilters(f => ({ ...f, lookingFor: gender }))}
                  className={`flex-1 py-3.5 rounded-xl text-[13px] font-bold border transition-all active:scale-98 ${
                    filters.lookingFor === gender
                      ? 'bg-rose-500 border-rose-500 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  {gender === 'Female' ? 'Bride' : 'Groom'} ({gender})
                </button>
              ))}
            </div>
          </div>

          {/* Age Range */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider">Age Range</label>
              <span className="text-[13px] font-extrabold text-slate-800">{filters.minAge} to {filters.maxAge} Yrs</span>
            </div>
            <div className="flex gap-4 items-center">
              <input
                type="range"
                min="18"
                max="45"
                value={filters.minAge}
                onChange={(e) => setFilters(f => ({ ...f, minAge: Math.min(parseInt(e.target.value), f.maxAge - 1) }))}
                className="w-full accent-rose-500"
              />
              <input
                type="range"
                min="18"
                max="45"
                value={filters.maxAge}
                onChange={(e) => setFilters(f => ({ ...f, maxAge: Math.max(parseInt(e.target.value), f.minAge + 1) }))}
                className="w-full accent-rose-500"
              />
            </div>
          </div>

          {/* Gotra */}
          <div>
            <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Gotra</label>
            <select
              value={filters.gotra}
              onChange={(e) => setFilters(f => ({ ...f, gotra: e.target.value }))}
              className={inputClass}
            >
              <option value="All">All Gotras</option>
              {['Garg', 'Goyal', 'Bansal', 'Mittal', 'Jatav', 'Jindal', 'Bharadwaj'].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">City</label>
            <select
              value={filters.city}
              onChange={(e) => setFilters(f => ({ ...f, city: e.target.value }))}
              className={inputClass}
            >
              <option value="All">All Cities</option>
              {['Delhi', 'Mumbai', 'Bangalore', 'Indore', 'Pune', 'Surat'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Diet */}
          <div>
            <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Diet</label>
            <select
              value={filters.diet}
              onChange={(e) => setFilters(f => ({ ...f, diet: e.target.value }))}
              className={inputClass}
            >
              <option value="All">Show All</option>
              {['Vegetarian', 'Non-Vegetarian', 'Eggetarian'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Marital Status */}
          <div>
            <label className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Marital Status</label>
            <select
              value={filters.maritalStatus}
              onChange={(e) => setFilters(f => ({ ...f, maritalStatus: e.target.value }))}
              className={inputClass}
            >
              <option value="All">Show All</option>
              {['Never Married', 'Divorced', 'Widowed'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-4 pt-2">
            {[
              { key: 'photoOnly', label: 'Profiles with Photo Only' },
              { key: 'onlineOnly', label: 'Online Matches Only' },
              { key: 'verifiedOnly', label: 'Verified Profiles Only' }
            ].map(item => (
              <label key={item.key} className="flex items-center justify-between cursor-pointer">
                <span className="text-[13px] font-bold text-slate-700">{item.label}</span>
                <div
                  onClick={() => setFilters(f => ({ ...f, [item.key]: !f[item.key] }))}
                  className={`w-11 h-6 rounded-full transition-all relative ${
                    filters[item.key] ? 'bg-rose-500' : 'bg-slate-200'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    filters[item.key] ? 'translate-x-5.5' : 'translate-x-0.5'
                  }`} />
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Search Button */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 p-4 z-20 shadow-lg" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
        <button
          onClick={handleApply}
          className="w-full py-3.5 bg-rose-500 text-white rounded-2xl text-[14px] font-extrabold flex items-center justify-center gap-2 shadow-md shadow-rose-200 active:scale-95 transition-transform"
        >
          <Search size={16} /> Search Compatibility Matches
        </button>
      </div>
    </div>
  );
};

export default MatrimonialSearchPage;
