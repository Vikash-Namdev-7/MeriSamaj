import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { useData } from '../../context/DataProvider';

const MatrimonialContext = createContext(null);

/**
 * MatrimonialProvider — Dedicated context for the Matrimonial module.
 * Manages shortlisting, recently viewed, search history, view mode,
 * and wraps child routes via <Outlet />.
 */
export const MatrimonialProvider = () => {
  // Pull shared data from the main DataProvider
  const { matrimonialProfiles } = useData();

  // ─── LOCAL STATE ───
  const loadState = (key, fallback) => {
    try {
      const raw = localStorage.getItem(`merisamaj_matri_${key}`);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  };

  const [shortlistedIds, setShortlistedIds] = useState(() => loadState('shortlisted', []));
  const [recentlyViewedIds, setRecentlyViewedIds] = useState(() => loadState('recentlyViewed', []));
  const [blockedIds, setBlockedIds] = useState(() => loadState('blocked', []));
  const [viewMode, setViewMode] = useState(() => loadState('viewMode', 'grid')); // 'grid' | 'list'
  const [activeDiscoveryTab, setActiveDiscoveryTab] = useState('daily');
  const [searchFilters, setSearchFilters] = useState(null);

  // Persist to localStorage
  useEffect(() => { localStorage.setItem('merisamaj_matri_shortlisted', JSON.stringify(shortlistedIds)); }, [shortlistedIds]);
  useEffect(() => { localStorage.setItem('merisamaj_matri_recentlyViewed', JSON.stringify(recentlyViewedIds)); }, [recentlyViewedIds]);
  useEffect(() => { localStorage.setItem('merisamaj_matri_blocked', JSON.stringify(blockedIds)); }, [blockedIds]);
  useEffect(() => { localStorage.setItem('merisamaj_matri_viewMode', JSON.stringify(viewMode)); }, [viewMode]);

  // ─── ACTIONS ───
  const toggleShortlist = useCallback((profileId) => {
    setShortlistedIds(prev =>
      prev.includes(profileId) ? prev.filter(id => id !== profileId) : [...prev, profileId]
    );
  }, []);

  const isShortlisted = useCallback((profileId) => {
    return shortlistedIds.includes(profileId);
  }, [shortlistedIds]);

  const addToRecentlyViewed = useCallback((profileId) => {
    setRecentlyViewedIds(prev => {
      const filtered = prev.filter(id => id !== profileId);
      return [profileId, ...filtered].slice(0, 30); // Keep last 30
    });
  }, []);

  const toggleBlock = useCallback((profileId) => {
    setBlockedIds(prev =>
      prev.includes(profileId) ? prev.filter(id => id !== profileId) : [...prev, profileId]
    );
  }, []);

  const isBlocked = useCallback((profileId) => {
    return blockedIds.includes(profileId);
  }, [blockedIds]);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  }, []);

  // ─── DERIVED DATA ───
  const shortlistedProfiles = matrimonialProfiles.filter(p => shortlistedIds.includes(p.id));
  const recentlyViewedProfiles = recentlyViewedIds
    .map(id => matrimonialProfiles.find(p => p.id === id))
    .filter(Boolean);

  // Exclude blocked profiles from general views
  const visibleProfiles = matrimonialProfiles.filter(p => !blockedIds.includes(p.id));

  const value = {
    // State
    shortlistedIds,
    recentlyViewedIds,
    blockedIds,
    viewMode,
    activeDiscoveryTab,

    // Derived
    shortlistedProfiles,
    recentlyViewedProfiles,
    visibleProfiles,

    // Actions
    toggleShortlist,
    isShortlisted,
    addToRecentlyViewed,
    toggleBlock,
    isBlocked,
    toggleViewMode,
    setActiveDiscoveryTab,
    searchFilters,
    setSearchFilters,
  };

  return (
    <MatrimonialContext.Provider value={value}>
      <Outlet />
    </MatrimonialContext.Provider>
  );
};

export const useMatrimonial = () => {
  const context = useContext(MatrimonialContext);
  if (!context) {
    throw new Error('useMatrimonial must be used within a MatrimonialProvider');
  }
  return context;
};
