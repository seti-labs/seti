import { useState, useEffect, useRef, useCallback } from 'react';
import { MarketData } from '@/types/contract';
import { marketsApi } from '@/services/api';

export function useMarkets(params?: {
  category?: string;
  status?: 'active' | 'resolved';
  sort_by?: 'volume_24h' | 'total_liquidity' | 'created_timestamp';
  search?: string;
}) {
  // All hooks must be called unconditionally at the top level
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialLoadRef = useRef(true);
  const isPollingRef = useRef(false);
  const paramsRef = useRef(params);

  // Keep params ref updated
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const fetchMarkets = useCallback(async (isBackgroundUpdate = false) => {
    // Prevent multiple simultaneous requests
    if (isPollingRef.current && isBackgroundUpdate) {
      return;
    }

    try {
      // Only show loading state on initial load, not on background updates
      if (!isBackgroundUpdate) {
        setIsLoading(true);
      }
      isPollingRef.current = true;
      setError(null);

      // Use ref to get latest params to avoid stale closure
      const currentParams = paramsRef.current;
      
      // Fetch from backend API with proper parameters
      const apiParams = {
        ...currentParams,
        sort_by: currentParams?.sort_by || 'created_timestamp',
        per_page: 50 // Increase limit for better UX
      };
      
      const response = await marketsApi.getAll(apiParams);
      
      // If no markets, show empty state
      if (!response.markets || response.markets.length === 0) {
        if (!isBackgroundUpdate) {
          setMarkets([]);
        }
        return;
      }

      // Transform backend data to MarketData format
      const transformedMarkets: MarketData[] = response.markets.map((market: any) => {
        // Transform tags: handle both string arrays and object arrays
        let tags: string[] = [];
        if (market.tags && Array.isArray(market.tags)) {
          tags = market.tags.map((tag: any) => {
            // If tag is already a string, use it
            if (typeof tag === 'string') {
              return tag;
            }
            // If tag is an object, extract name or label
            if (typeof tag === 'object' && tag !== null) {
              return tag.name || tag.label || tag.slug || String(tag);
            }
            return String(tag);
          });
        }
        
        return {
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
          tags: tags,
        };
      });

      // Silently update markets state - React will handle the diff and only update changed items
      // This prevents any visual "break and come back" effect
      setMarkets(prevMarkets => {
        // Only update if data actually changed to prevent unnecessary re-renders
        const prevIds = new Set(prevMarkets.map(m => m.id));
        const newIds = new Set(transformedMarkets.map(m => m.id));
        
        // Check if markets changed
        const idsChanged = prevMarkets.length !== transformedMarkets.length ||
          transformedMarkets.some(m => !prevIds.has(m.id)) ||
          prevMarkets.some(m => !newIds.has(m.id));
        
        // Check if any market data changed
        const dataChanged = transformedMarkets.some(newMarket => {
          const oldMarket = prevMarkets.find(m => m.id === newMarket.id);
          if (!oldMarket) return true;
          return oldMarket.volume_24h !== newMarket.volume_24h ||
                 oldMarket.total_liquidity !== newMarket.total_liquidity ||
                 oldMarket.outcome_a_shares !== newMarket.outcome_a_shares ||
                 oldMarket.outcome_b_shares !== newMarket.outcome_b_shares ||
                 oldMarket.resolved !== newMarket.resolved;
        });
        
        // Only update if something actually changed
        if (idsChanged || dataChanged) {
          return transformedMarkets;
        }
        return prevMarkets; // Return previous to prevent re-render
      });

    } catch (err) {
      // Silently handle errors in background updates - don't disrupt user experience
      if (!isBackgroundUpdate) {
        // Only log/show errors on initial load
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching markets:', err);
        }
        
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        if (!errorMessage.includes('Failed to fetch') && !errorMessage.includes('500')) {
          setError(err instanceof Error ? err.message : 'Failed to fetch markets');
        }
        setMarkets([]);
      }
      // Background update errors are silently ignored to prevent disruption
    } finally {
      if (!isBackgroundUpdate) {
        setIsLoading(false);
      }
      isPollingRef.current = false;
      isInitialLoadRef.current = false;
    }
  }, []); // Empty deps - we use refs to access latest params

  useEffect(() => {
    // Reset initial load flag when params change
    isInitialLoadRef.current = true;
    
    // Initial fetch immediately (no delay to avoid visible loading)
    fetchMarkets(false);
    
    // Set up polling every 10 seconds for silent background updates
    const pollInterval = setInterval(() => {
      fetchMarkets(true); // Pass true to indicate background update
    }, 10000); // 10 seconds
    
    return () => {
      clearInterval(pollInterval);
    };
  }, [fetchMarkets, params?.category, params?.status, params?.sort_by, params?.search]);

  return {
    markets,
    isLoading,
    error,
    refetch: () => fetchMarkets(false),
  };
}
