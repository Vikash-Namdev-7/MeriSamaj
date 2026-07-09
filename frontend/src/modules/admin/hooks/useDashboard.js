import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';

export const useDashboard = () => {
  const [stats, setStats] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [heads, setHeads] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [
        statsData, 
        communitiesData, 
        headsData, 
        auditLogsData, 
        healthData
      ] = await Promise.all([
        dashboardService.getPlatformStats(),
        dashboardService.getCommunities(),
        dashboardService.getCommunityHeads(),
        dashboardService.getAuditLogs(),
        dashboardService.getSystemHealth()
      ]);

      setStats(statsData);
      setCommunities(communitiesData);
      setHeads(headsData);
      setAuditLogs(auditLogsData);
      setSystemHealth(healthData);
      
    } catch (err) {
      setError('Failed to fetch dashboard data. Please try again.');
      console.error('Dashboard Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    communities,
    heads,
    auditLogs,
    systemHealth,
    loading,
    error,
    refreshData: fetchDashboardData
  };
};
