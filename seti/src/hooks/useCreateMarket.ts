import { useState } from 'react';
import { useAccount } from 'wagmi';

export interface CreateMarketParams {
  question: string;
  description: string;
  endTime: Date;
  category: string;
  imageUrl: string;
  tags: string[];
  initialLiquidityEth: number;
}

export interface UseCreateMarketResult {
  createMarket: (params: CreateMarketParams) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to create a new market
 */
export function useCreateMarket(): UseCreateMarketResult {
  const { isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMarket = async (params: CreateMarketParams): Promise<string | null> => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate market creation - replace with actual blockchain interaction
      // Remove artificial delay - use real API call
      
      const marketId = `market-${Date.now()}`;
      console.log('Market created:', marketId);

      return marketId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create market';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createMarket,
    isLoading,
    error
  };
}