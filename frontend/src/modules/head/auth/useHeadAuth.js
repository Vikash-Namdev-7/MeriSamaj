import { useContext } from 'react';
import { HeadAuthContext } from './HeadAuthContext';

export const useHeadAuth = () => {
  const context = useContext(HeadAuthContext);

  if (context === undefined) {
    throw new Error('useHeadAuth must be used within a HeadAuthProvider');
  }

  return context;
};
