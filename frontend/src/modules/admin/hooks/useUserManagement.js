import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';

export const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters state
  const [filters, setFilters] = useState({
    searchQuery: '',
    status: 'All',
    community: 'All Communities',
    role: 'All Roles'
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, statsRes] = await Promise.all([
        userService.getAllUsers(filters),
        userService.getDashboardStats()
      ]);
      setUsers(usersRes.data);
      setStats(statsRes);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      await userService.updateUserStatus(userId, newStatus);
      // Optimistic update
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, accountStatus: newStatus } : u
      ));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      await userService.verifyUser(userId);
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, isVerified: true, verificationStatus: 'Verified', accountStatus: 'Active' } : u
      ));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return {
    users,
    stats,
    loading,
    error,
    filters,
    setFilters,
    handleUpdateStatus,
    handleVerifyUser,
    refreshData: fetchData
  };
};
