import { useState, useEffect } from 'react';
import { predictionsApi } from '@/services/api';

export interface UserPrediction {
  id: string;
  market_id: string;
  user_address: string;
  outcome: number;
  amount: number;
  price?: number;
  shares?: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'active' | 'resolved' | 'won' | 'lost';
  market?: {
    id: string;
    question: string;
    description: string;
    category: string;
    resolved: boolean;
    winning_outcome?: number;
    end_time: number;
  };
}

export function useUserPredictions(userAddress?: string) {
  const [predictions, setPredictions] = useState<UserPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userAddress) {
      loadPredictions();
    } else {
      setPredictions([]);
    }
  }, [userAddress]);

  const loadPredictions = async () => {
    if (!userAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await predictionsApi.getAll({
        user_address: userAddress,
        per_page: 100
      });
      
      setPredictions(response.predictions || []);
    } catch (err) {
      console.error('Error loading user predictions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load predictions');
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    if (userAddress) {
      loadPredictions();
    }
  };

  return {
    predictions,
    isLoading,
    error,
    refetch
  };
}