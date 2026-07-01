import { useEffect, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export const usePageTransition = () => {
  const location = useLocation();
  const navigationType = useNavigationType(); // PUSH, POP, or REPLACE
  const [transitionClass, setTransitionClass] = useState('animate-fade-in');

  useEffect(() => {
    // Basic logic: 
    // PUSH -> slide in from right
    // POP -> slide in from left (back navigation)
    // REPLACE or initial -> fade in or crossfade
    
    if (navigationType === 'PUSH') {
      setTransitionClass('animate-slide-in-right');
    } else if (navigationType === 'POP') {
      setTransitionClass('animate-slide-in-left');
    } else {
      setTransitionClass('animate-fade-in');
    }
  }, [location.pathname, navigationType]);

  return transitionClass;
};
