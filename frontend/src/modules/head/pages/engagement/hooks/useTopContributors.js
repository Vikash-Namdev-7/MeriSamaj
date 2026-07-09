import { useState, useEffect, useCallback } from 'react';
import { useData } from '../../../../member/context/DataProvider';

export const useTopContributors = () => {
  const { currentUser } = useData();
  const [contributors, setContributors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContributors = useCallback(async () => {
    if (!currentUser?.communityId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 600));
      setContributors([
        { id: 1, name: 'Ananya Sharma', role: 'Active Member', score: 98, rank: 1, badges: ['most_active', 'event_champion'], avatar: null },
        { id: 2, name: 'Ravi Verma', role: 'Volunteer', score: 85, rank: 2, badges: ['top_volunteer'], avatar: null },
        { id: 3, name: 'Sunita Devi', role: 'Member', score: 72, rank: 3, badges: ['helping_hand'], avatar: null }
      ]);
    } catch (err) {
      setError(err.message || 'Failed to load top contributors');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.communityId]);

  useEffect(() => {
    fetchContributors();
  }, [fetchContributors]);

  return { contributors, isLoading, error, refetch: fetchContributors };
};
