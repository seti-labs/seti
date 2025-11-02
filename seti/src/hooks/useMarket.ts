import { useState, useEffect, useCallback } from 'react';
import { MarketData, UseMarketResult } from '@/types/contract';
import { marketsApi } from '@/services/api';
import { useContractMarket } from './useContract';

/**
 * Hook to fetch a single market by ID
 * Fetches from backend first (fast), falls back to blockchain if needed
 */
export function useMarket(marketId: string): UseMarketResult {
  const [data, setData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use smart contract hook for blockchain data
  const { market: contractMarket, isLoading: contractLoading, error: contractError } = useContractMarket(parseInt(marketId));

  const fetchMarket = useCallback(async () => {
    if (!marketId) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try backend first (fast)
      const response = await marketsApi.getById(marketId);
      if (response.market) {
        setData(response.market);
        return;
      }
    } catch (backendError) {
      console.warn('Backend fetch failed, will try blockchain:', backendError);
    }

    // If backend fails, use contract data
    if (contractMarket) {
      const marketData: MarketData = {
        id: marketId,
        question: contractMarket.question,
        description: contractMarket.description,
        category: 'Unknown', // Contract doesn't store category
        end_time: Number(contractMarket.endTime),
        total_liquidity: Number(contractMarket.yesPool + contractMarket.noPool),
        outcome_a_shares: Number(contractMarket.noPool),
        outcome_b_shares: Number(contractMarket.yesPool),
        volume_24h: 0, // Contract doesn't track 24h volume
        resolved: contractMarket.resolved,
        winning_outcome: contractMarket.winningOutcome,
        created_timestamp: 0, // Contract doesn't store creation time
        tags: [], // Contract doesn't store tags
        image_url: '', // Contract doesn't store images
        status: contractMarket.resolved ? 'resolved' : 'active'
      };
      
      setData(marketData);
    } else if (contractError) {
      setError(contractError);
    } else {
      setError('Market not found');
    }
  }, [marketId, contractMarket, contractError]);

  useEffect(() => {
    fetchMarket();
  }, [fetchMarket]);

  return {
    data,
    isLoading: isLoading || contractLoading,
    error,
    refetch: fetchMarket
  };
}