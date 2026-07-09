import { useState, useEffect, useCallback } from 'react';
import { useData } from '../../../../member/context/DataProvider';

export const useInactiveMembers = () => {
  const { currentUser } = useData();
  const [inactiveMembers, setInactiveMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInactive = useCallback(async () => {
    if (!currentUser?.communityId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 600));
      setInactiveMembers([
        { id: 101, name: 'Ramesh Patel', daysInactive: 45, missedEvents: 3, score: 12, avatar: null },
        { id: 102, name: 'Sneha Gupta', daysInactive: 60, missedEvents: 5, score: 5, avatar: null }
      ]);
    } catch (err) {
      setError(err.message || 'Failed to load inactive members');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.communityId]);

  useEffect(() => {
    fetchInactive();
  }, [fetchInactive]);

  return { inactiveMembers, isLoading, error, refetch: fetchInactive };
};
