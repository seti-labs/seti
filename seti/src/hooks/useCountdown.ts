import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for real-time countdown display
 * Updates every second to show live time remaining
 */
export function useCountdown(endTime: number) {
  // Initialize with default values to ensure consistent hook order
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isEnded, setIsEnded] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  const updateCountdown = useCallback(() => {
    // Safety check for valid endTime
    if (!endTime || typeof endTime !== 'number' || endTime <= 0) {
      setTimeLeft("Invalid");
      setIsEnded(true);
      setIsUrgent(false);
      return;
    }

    const now = Date.now() / 1000; // Convert to seconds
    const timeRemaining = endTime - now;
    
    if (timeRemaining <= 0) {
      setTimeLeft("Ended");
      setIsEnded(true);
      setIsUrgent(false);
      return;
    }
    
    const days = Math.floor(timeRemaining / 86400);
    const hours = Math.floor((timeRemaining % 86400) / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = Math.floor(timeRemaining % 60);
    
    // Check if market is closing soon (less than 1 hour)
    const isClosingSoon = timeRemaining < 3600; // 1 hour = 3600 seconds
    setIsUrgent(isClosingSoon);
    
    if (days > 0) {
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    } else if (hours > 0) {
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    } else if (minutes > 0) {
      setTimeLeft(`${minutes}m ${seconds}s`);
    } else {
      setTimeLeft(`${seconds}s`);
    }
    
    setIsEnded(false);
  }, [endTime]);

  useEffect(() => {
    // Update immediately
    updateCountdown();
    
    // Set up interval to update every second
    const interval = setInterval(updateCountdown, 1000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [updateCountdown]);

  return { timeLeft, isEnded, isUrgent };
}
