import { useState, useEffect, useCallback } from 'react';
import { useData } from '../../../../member/context/DataProvider';
import { engagementMetricsService } from '../services/engagementMetrics';

export const useEngagementDashboard = () => {
  const { currentUser } = useData();
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    if (!currentUser?.communityId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await engagementMetricsService.getDashboardMetrics(currentUser.communityId);
      setMetrics(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.communityId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, isLoading, error, refetch: fetchMetrics };
};
