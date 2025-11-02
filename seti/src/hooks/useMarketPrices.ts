import { useState, useEffect } from 'react';
import { useContractMarket, contractUtils } from './useContract';

export interface MarketPrices {
  yesPrice: number;
  noPrice: number;
  totalLiquidity: number;
  totalVolume: number;
}

export interface UseMarketPricesResult {
  prices: MarketPrices | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMarketPrices(marketId: string): UseMarketPricesResult {
  const [prices, setPrices] = useState<MarketPrices | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use smart contract hook for market data
  const { market: contractMarket, isLoading: contractLoading, error: contractError } = useContractMarket(parseInt(marketId));

  const fetchPrices = async () => {
    if (!marketId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Try API first (fast)
      try {
        const response = await fetch(`/api/v1/markets/${marketId}/prices`)
        if (response.ok) {
          const priceData = await response.json()
          setPrices(priceData)
          return;
        }
      } catch (apiError) {
        console.warn('API fetch failed, will try contract:', apiError);
      }

      // Fallback to smart contract data
      if (contractMarket) {
        const { yesPrice, noPrice } = contractUtils.calculatePrices(contractMarket.yesPool, contractMarket.noPool);
        const totalLiquidity = Number(contractMarket.yesPool + contractMarket.noPool);
        
        setPrices({
          yesPrice,
          noPrice,
          totalLiquidity,
          totalVolume: 0 // Contract doesn't track 24h volume
        });
      } else if (contractError) {
        setError(contractError);
      } else {
        setError('Failed to fetch market prices');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch prices';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [marketId, contractMarket, contractError]);

  return {
    prices,
    isLoading: isLoading || contractLoading,
    error,
    refetch: fetchPrices
  };
}