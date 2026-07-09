import { useState, useEffect, useCallback } from 'react';
import { subscriptionService } from '../services/subscriptionService';

export const useSubscriptions = () => {
  const [data, setData] = useState({
    stats: null,
    plans: [],
    subscribers: [],
    coupons: [],
    invoices: [],
    auditLogs: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [stats, plans, subscribers, coupons, invoices, auditLogs] = await Promise.all([
        subscriptionService.getOverviewStats(),
        subscriptionService.getPlans(),
        subscriptionService.getSubscribers(),
        subscriptionService.getCoupons(),
        subscriptionService.getInvoices(),
        subscriptionService.getAuditLogs()
      ]);

      setData({
        stats,
        plans,
        subscribers,
        coupons,
        invoices,
        auditLogs
      });
    } catch (err) {
      console.error('Failed to load subscription data:', err);
      setError('Failed to load enterprise subscription data. Please try again.');
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
