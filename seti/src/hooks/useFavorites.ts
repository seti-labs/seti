import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('seti_favorites');
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        setFavorites(new Set(parsed));
      } catch (e) {
        console.error('Error parsing saved favorites:', e);
        setFavorites(new Set());
      }
    }
  }, []);

  const toggleFavorite = (marketId: string) => {
    const newFavorites = new Set(favorites);
    
    if (newFavorites.has(marketId)) {
      newFavorites.delete(marketId);
    } else {
      newFavorites.add(marketId);
    }
    
    setFavorites(newFavorites);
    localStorage.setItem('seti_favorites', JSON.stringify([...newFavorites]));
  };

  const isFavorite = (marketId: string): boolean => {
    return favorites.has(marketId);
  };

  return {
    favorites: [...favorites],
    isFavorite,
    toggleFavorite,
  };
}
