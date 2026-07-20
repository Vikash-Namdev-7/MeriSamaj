import { useState, useEffect, useCallback } from 'react';
import { communityHeadService } from '../services/communityHeadService';

export const useCommunityHeads = () => {
  const [heads, setHeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [headsData, statsData, logsData] = await Promise.all([
        communityHeadService.getHeads(),
        communityHeadService.getStats(),
        communityHeadService.getAuditLogs()
      ]);

      setHeads(headsData);
      setStats(statsData);
      setAuditLogs(logsData);
    } catch (err) {
      setError('Failed to fetch Community Heads data.');
      console.error('Community Heads Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await communityHeadService.updateStatus(id, newStatus);
      const newStats = await communityHeadService.getStats();
      setStats(newStats);
      // Refresh locally
      setHeads(prev => prev.map(h => h.id === id ? { ...h, status: newStatus } : h));
      return true;
    } catch (err) {
      console.error('Failed to update status:', err);
      return false;
    }
  };

  const handleDeleteHead = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this Community Head? This action cannot be undone.")) return false;
    try {
      await communityHeadService.deleteHead(id);
      const newStats = await communityHeadService.getStats();
      setStats(newStats);
      // Refresh locally
      setHeads(prev => prev.filter(h => h.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete head:', err);
      alert(err.message || 'Failed to delete head');
      return false;
    }
  };

  const handleUpdateHead = async (id, data) => {
    setLoading(true);
    try {
      await communityHeadService.updateHead(id, data);
      await fetchDashboardData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const createHead = async (data) => {
    try {
      const newHead = await communityHeadService.createHead(data);
      const newStats = await communityHeadService.getStats();
      setStats(newStats);
      setHeads(prev => [newHead, ...prev]);
      return { success: true };
    } catch (err) {
      console.error('Failed to create head:', err);
      return { success: false, error: err.message || 'Failed to create head' };
    }
  };

  return {
    heads,
    stats,
    auditLogs,
    loading,
    error,
    refreshData: fetchDashboardData,
    handleStatusChange,
    handleDeleteHead,
    handleUpdateHead,
    createHead
  };
};
