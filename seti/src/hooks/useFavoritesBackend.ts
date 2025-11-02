import { useState, useEffect, useRef } from 'react';
import { favoritesApi } from '@/services/api';
import { useWalletConnection } from './useWalletConnection';

export function useFavoritesBackend() {
  const { address, isConnected } = useWalletConnection();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedAddressRef = useRef<string | null>(null);

  // Load favorites from backend when wallet connects - only once per address
  useEffect(() => {
    let mounted = true;
    
    if (isConnected && address) {
      // Prevent repeated fetches by ensuring we only load once per wallet address
      if (loadedAddressRef.current !== address) {
        loadedAddressRef.current = address;
        loadFavorites();
      }
    } else {
      // Reset to empty when disconnected
      setFavorites(new Set());
      loadedAddressRef.current = null;
    }
    
    return () => {
      mounted = false;
    };
  }, [isConnected, address]);

  const loadFavorites = async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await favoritesApi.getUserFavorites(address, 1, 100); // Get first 100 favorites
      const favoriteIds = response.favorites.map((fav: any) => fav.market_id);
      setFavorites(new Set(favoriteIds));

      // Also sync to localStorage for offline access
      localStorage.setItem('seti_favorites', JSON.stringify(favoriteIds));
    } catch (err) {
      // Only log error in development, suppress in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load favorites from backend:', err);
      }
      
      // Don't set error state for network issues to prevent premature alerts
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (!errorMessage.includes('Failed to fetch') && !errorMessage.includes('500')) {
        setError('Failed to load favorites');
      }
      
      // Fallback to localStorage if backend fails
      const saved = localStorage.getItem('seti_favorites');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFavorites(new Set(parsed));
        } catch (parseErr) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to parse saved favorites:', parseErr);
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (marketId: string) => {
    if (!address) {
      setError('Wallet not connected');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await favoritesApi.toggleFavorite(address, marketId);
      
      // Update local state
      const newFavorites = new Set(favorites);
      if (response.is_favorite) {
        newFavorites.add(marketId);
      } else {
        newFavorites.delete(marketId);
      }
      setFavorites(newFavorites);

      // Update localStorage
      localStorage.setItem('seti_favorites', JSON.stringify([...newFavorites]));

      return true;
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      setError('Failed to update favorite');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const addFavorite = async (marketId: string) => {
    if (!address) {
      setError('Wallet not connected');
      return false;
    }

    if (favorites.has(marketId)) {
      return true; // Already favorited
    }

    setIsLoading(true);
    setError(null);

    try {
      await favoritesApi.addFavorite(address, marketId);
      
      // Update local state
      const newFavorites = new Set(favorites);
      newFavorites.add(marketId);
      setFavorites(newFavorites);

      // Update localStorage
      localStorage.setItem('seti_favorites', JSON.stringify([...newFavorites]));

      return true;
    } catch (err) {
      console.error('Failed to add favorite:', err);
      setError('Failed to add favorite');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (marketId: string) => {
    if (!address) {
      setError('Wallet not connected');
      return false;
    }

    if (!favorites.has(marketId)) {
      return true; // Already not favorited
    }

    setIsLoading(true);
    setError(null);

    try {
      await favoritesApi.removeFavorite(address, marketId);
      
      // Update local state
      const newFavorites = new Set(favorites);
      newFavorites.delete(marketId);
      setFavorites(newFavorites);

      // Update localStorage
      localStorage.setItem('seti_favorites', JSON.stringify([...newFavorites]));

      return true;
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      setError('Failed to remove favorite');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const isFavorite = (marketId: string): boolean => {
    return favorites.has(marketId);
  };

  const checkFavorite = async (marketId: string) => {
    if (!address) return false;

    try {
      const response = await favoritesApi.checkFavorite(address, marketId);
      return response.is_favorite;
    } catch (err) {
      console.error('Failed to check favorite status:', err);
      return false;
    }
  };

  return {
    favorites: [...favorites],
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    checkFavorite,
    loadFavorites,
    isLoading,
    error,
  };
}
