/**
 * useGroups.js
 * Data fetching hook for Community Groups.
 * Replaces DataProvider mock group state.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { groupService } from '../../../core/api/groupService';

/**
 * @param {Object} options
 * @param {string} [options.category]  - Filter by category
 * @param {string} [options.search]    - Search query
 * @param {string} [options.type]      - Filter by group type
 * @param {boolean} [options.myGroupsOnly] - Show only joined groups
 */
export const useGroups = ({ category, search, type, myGroupsOnly = false } = {}) => {
  const [groups, setGroups]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const [hasMore, setHasMore]     = useState(false);
  const abortRef = useRef(null);
  const LIMIT = 20;

  const fetchGroups = useCallback(async (pageNum = 1, append = false) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      let res;
      if (myGroupsOnly) {
        res = await groupService.getMyGroups();
        const fetched = res.data?.data?.groups || [];
        setGroups(fetched);
        setTotal(fetched.length);
        setHasMore(false);
      } else {
        res = await groupService.getGroups({ page: pageNum, limit: LIMIT, category, search, type });
        const fetched = res.data?.data?.groups || [];
        const tot     = res.data?.data?.total || 0;
        setGroups(prev => append ? [...prev, ...fetched] : fetched);
        setTotal(tot);
        setHasMore((pageNum * LIMIT) < tot);
        setPage(pageNum);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.response?.data?.message || 'Failed to load groups.');
      }
    } finally {
      setLoading(false);
    }
  }, [category, search, type, myGroupsOnly]);

  useEffect(() => {
    fetchGroups(1);
    return () => abortRef.current?.abort();
  }, [fetchGroups]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) fetchGroups(page + 1, true);
  }, [fetchGroups, hasMore, loading, page]);

  const refresh = useCallback(() => fetchGroups(1), [fetchGroups]);

  // ── Mutation helpers ────────────────────────────────────────────────────────

  const createGroup = useCallback(async (formData) => {
    const res = await groupService.createGroup(formData);
    const newGroup = res.data?.data?.group;
    if (newGroup) {
      setGroups(prev => [newGroup, ...prev]);
    }
    return res.data?.data;
  }, []);

  const joinGroup = useCallback(async (groupId) => {
    await groupService.joinGroup(groupId);
    setGroups(prev =>
      prev.map(g => g._id === groupId ? { ...g, isJoined: true } : g)
    );
  }, []);

  const leaveGroup = useCallback(async (groupId) => {
    await groupService.leaveGroup(groupId);
    setGroups(prev =>
      prev.map(g => g._id === groupId ? { ...g, isJoined: false } : g)
    );
  }, []);

  const deleteGroup = useCallback(async (groupId) => {
    await groupService.deleteGroup(groupId);
    setGroups(prev => prev.filter(g => g._id !== groupId));
  }, []);

  const muteGroup = useCallback(async (groupId) => {
    // Optimistic update
    setGroups(prev =>
      prev.map(g => (g._id || g.id) === groupId ? { ...g, isMuted: !g.isMuted } : g)
    );
    try {
      if (groupService.muteGroup) {
        await groupService.muteGroup(groupId);
      }
    } catch {
      // Rollback optimistic update on failure
      setGroups(prev =>
        prev.map(g => (g._id || g.id) === groupId ? { ...g, isMuted: !g.isMuted } : g)
      );
    }
  }, []);

  return {
    groups,
    loading,
    error,
    total,
    hasMore,
    loadMore,
    refresh,
    refreshGroups: refresh, // alias used by GroupDetailPage
    createGroup,
    joinGroup,
    leaveGroup,
    leaveGroupById: leaveGroup, // alias
    muteGroup,
    deleteGroup
  };
};

export default useGroups;
