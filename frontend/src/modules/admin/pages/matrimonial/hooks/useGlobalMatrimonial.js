import { useState, useEffect, useCallback } from 'react';
import { matrimonialService } from '../services/matrimonialService';

export const useGlobalMatrimonial = () => {
  const [data, setData] = useState({
    stats: null,
    profiles: [],
    reports: [],
    auditLogs: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [stats, profiles, reports, auditLogs] = await Promise.all([
        matrimonialService.getDashboardStats(),
        matrimonialService.getProfiles(),
        matrimonialService.getReports(),
        matrimonialService.getAuditLogs()
      ]);

      setData({
        stats,
        profiles,
        reports,
        auditLogs
      });
    } catch (err) {
      console.error('Failed to load matrimonial data:', err);
      setError('Failed to load platform-wide matrimonial data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const refreshData = () => {
    fetchAllData();
  };

  return {
    ...data,
    loading,
    error,
    refreshData
  };
};
