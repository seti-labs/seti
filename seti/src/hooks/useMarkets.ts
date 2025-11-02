import { useState, useEffect } from 'react';
import { MarketData } from '@/types/contract';
import { marketsApi } from '@/services/api';

export function useMarkets(params?: {
  category?: string;
  status?: 'active' | 'resolved';
  sort_by?: 'volume_24h' | 'total_liquidity' | 'created_timestamp';
  search?: string;
}) {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarkets = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch from backend API with proper parameters
      const apiParams = {
        ...params,
        sort_by: params?.sort_by || 'created_timestamp',
        per_page: 50 // Increase limit for better UX
      };
      
      const response = await marketsApi.getAll(apiParams);
      
      // If no markets, show empty state
      if (!response.markets || response.markets.length === 0) {
        setMarkets([]);
        return;
      }

      // Transform backend data to MarketData format
      const transformedMarkets: MarketData[] = response.markets.map((market: any) => ({
        id: market.id,
        question: market.question,
        description: market.description,
        end_time: market.end_time,
        creator: market.creator,
        resolved: market.resolved,
        winning_outcome: market.winning_outcome,
        total_liquidity: market.total_liquidity,
        outcome_a_shares: market.outcome_a_shares,
        outcome_b_shares: market.outcome_b_shares,
        liquidity_providers: market.liquidity_providers || {},
        volume_24h: market.volume_24h,
        created_timestamp: market.created_timestamp,
        category: market.category,
        image_url: market.image_url || 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=300&fit=crop',
        tags: market.tags || [],
      }));

      setMarkets(transformedMarkets);

    } catch (err) {
      // Only log error in development, suppress in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching markets:', err);
      }
      
      // Don't set error state for network issues to prevent premature alerts
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (!errorMessage.includes('Failed to fetch') && !errorMessage.includes('500')) {
        setError(err instanceof Error ? err.message : 'Failed to fetch markets');
      }
      setMarkets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Add a small delay to prevent premature API calls
    const timer = setTimeout(() => {
      fetchMarkets();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [params?.category, params?.status, params?.sort_by, params?.search]);

  return {
    markets,
    isLoading,
    error,
    refetch: fetchMarkets,
  };
}
