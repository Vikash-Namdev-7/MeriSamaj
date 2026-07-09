import { useState, useEffect, useCallback } from 'react';
import { useData } from '../../../../member/context/DataProvider';

export const useRecognition = () => {
  const { currentUser } = useData();
  const [recognitionData, setRecognitionData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecognitions = useCallback(async () => {
    if (!currentUser?.communityId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 600));
      setRecognitionData([
        { id: 1, memberName: 'Ravi Verma', badge: 'top_volunteer', dateAwarded: '2026-07-01' },
        { id: 2, memberName: 'Ananya Sharma', badge: 'most_active', dateAwarded: '2026-06-15' }
      ]);
    } catch (err) {
      setError(err.message || 'Failed to load recognitions');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.communityId]);

  useEffect(() => {
    fetchRecognitions();
  }, [fetchRecognitions]);

  const awardBadge = async (memberId, badgeId) => {
    // API logic to award badge
    await new Promise(resolve => setTimeout(resolve, 500));
    fetchRecognitions();
  };

  return { recognitionData, isLoading, error, refetch: fetchRecognitions, awardBadge };
};
