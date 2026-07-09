import { useState, useEffect, useCallback } from 'react';
import { useData } from '../../../../member/context/DataProvider';
import { engagementMetricsService } from '../services/engagementMetrics';

export const useEngagementAnalytics = (dateRange = 'month') => {
  const { currentUser } = useData();
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCharts = useCallback(async () => {
    if (!currentUser?.communityId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await engagementMetricsService.getAnalyticsCharts(currentUser.communityId, dateRange);
      setChartData(data);
    } catch (err) {
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.communityId, dateRange]);

  useEffect(() => {
    fetchCharts();
  }, [fetchCharts]);

  return { chartData, isLoading, error, refetch: fetchCharts };
};
