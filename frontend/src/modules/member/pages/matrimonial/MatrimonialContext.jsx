import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { matrimonialDashboardService, matrimonialShortlistService, matrimonialModerationService } from '../../../../core/api/matrimonialService';

const MatrimonialContext = createContext(null);

/**
 * MatrimonialProvider — Root context for the Matrimonial module.
 * Now backed by real API calls. Wraps child routes via <Outlet />.
 */
export const MatrimonialProvider = () => {
  // ─── Dashboard Data ───────────────────────────────────────────────────────
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // ─── UI State ─────────────────────────────────────────────────────────────
  const [viewMode, setViewMode]                 = useState(() => {
    try { return JSON.parse(localStorage.getItem('merisamaj_matri_viewMode')) || 'grid'; } catch { return 'grid'; }
  });
  const [activeDiscoveryTab, setActiveDiscoveryTab] = useState('recommended');
  const [searchFilters, setSearchFilters]           = useState(null);

  // ─── Shortlist local state (synced from API) ──────────────────────────────
  const [shortlistedIds, setShortlistedIds] = useState([]);

  // ─── Blocked (local, backed by API calls) ────────────────────────────────
  const [blockedIds, setBlockedIds] = useState([]);

  // Persist view mode preference
  useEffect(() => {
    localStorage.setItem('merisamaj_matri_viewMode', JSON.stringify(viewMode));
  }, [viewMode]);

  // ─── Fetch Dashboard ──────────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    setDashboardLoading(true);
    try {
      const res = await matrimonialDashboardService.getDashboard();
      setDashboard(res.data.data.dashboard);
    } catch (err) {
      console.error('[MatrimonialContext] Dashboard fetch failed:', err.response?.data?.message);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  // ─── Shortlist Actions (API-backed) ──────────────────────────────────────
  const addToShortlist = useCallback(async (profileId, notes = '') => {
    try {
      await matrimonialShortlistService.addToShortlist({ profileId, notes });
      setShortlistedIds(prev => [...new Set([...prev, profileId])]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  }, []);

  const removeFromShortlist = useCallback(async (profileId) => {
    try {
      await matrimonialShortlistService.removeFromShortlist(profileId);
      setShortlistedIds(prev => prev.filter(id => id !== profileId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  }, []);

  const toggleShortlist = useCallback(async (profileId, notes = '') => {
    if (shortlistedIds.includes(profileId)) {
      return removeFromShortlist(profileId);
    }
    return addToShortlist(profileId, notes);
  }, [shortlistedIds, addToShortlist, removeFromShortlist]);

  const isShortlisted = useCallback((profileId) => shortlistedIds.includes(profileId), [shortlistedIds]);

  // ─── Block Actions (API-backed) ───────────────────────────────────────────
  const blockUser = useCallback(async (userId, reason = '') => {
    try {
      await matrimonialModerationService.blockUser({ userId, reason });
      setBlockedIds(prev => [...new Set([...prev, userId])]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  }, []);

  const unblockUser = useCallback(async (userId) => {
    try {
      await matrimonialModerationService.unblockUser(userId);
      setBlockedIds(prev => prev.filter(id => id !== userId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  }, []);

  const isBlocked = useCallback((userId) => blockedIds.includes(userId), [blockedIds]);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  }, []);

  const value = {
    // Dashboard
    dashboard,
    dashboardLoading,
    fetchDashboard,

    // UI
    viewMode,
    activeDiscoveryTab,
    setActiveDiscoveryTab,
    searchFilters,
    setSearchFilters,
    toggleViewMode,

    // Shortlist
    shortlistedIds,
    setShortlistedIds,
    toggleShortlist,
    addToShortlist,
    removeFromShortlist,
    isShortlisted,

    // Block
    blockedIds,
    blockUser,
    unblockUser,
    isBlocked,
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
