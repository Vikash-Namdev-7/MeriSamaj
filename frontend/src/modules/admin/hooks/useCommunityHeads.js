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

  const createHead = async (data) => {
    try {
      const newHead = await communityHeadService.createHead(data);
      const newStats = await communityHeadService.getStats();
      setStats(newStats);
      setHeads(prev => [newHead, ...prev]);
      return true;
    } catch (err) {
      console.error('Failed to create head:', err);
      return false;
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
    createHead
  };
};
