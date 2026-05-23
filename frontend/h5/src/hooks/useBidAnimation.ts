import { useState, useRef, useCallback, useEffect } from 'react';

interface AnimationOptions {
  duration?: number;
}

export const useBidAnimation = (options: AnimationOptions = {}) => {
  const { duration = 300 } = options;
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<'success' | 'fail' | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playSuccess = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsAnimating(true);
    setAnimationType('success');

    timeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      setAnimationType(null);
    }, duration);
  }, [duration]);

  const playFail = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsAnimating(true);
    setAnimationType('fail');

    timeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      setAnimationType(null);
    }, duration);
  }, [duration]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isAnimating,
    animationType,
    playSuccess,
    playFail,
  };
};
