import { useState, useEffect, useCallback } from 'react';
import { useData } from '../../../../member/context/DataProvider';

export const useTimeline = () => {
  const { currentUser } = useData();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTimeline = useCallback(async () => {
    if (!currentUser?.communityId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 600));
      setEvents([
        { id: 1, type: 'post', user: 'Amit Singh', target: 'General Discussion', time: '10 mins ago', avatar: null },
        { id: 2, type: 'donation', user: 'Kavita Roy', target: 'Building Fund', time: '2 hours ago', avatar: null, amount: 1000 },
        { id: 3, type: 'volunteer', user: 'Rakesh Sharma', target: 'Food Drive', time: '5 hours ago', avatar: null }
      ]);
    } catch (err) {
      setError(err.message || 'Failed to load timeline');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.communityId]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return { events, isLoading, error, refetch: fetchTimeline };
};
