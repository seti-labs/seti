import { useState, useEffect } from 'react';
import { usersApi } from '@/services/api';
import { useWalletConnection } from './useWalletConnection';

export interface UserPreferences {
  username?: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  notification_settings: {
    marketUpdates: boolean;
    positionAlerts: boolean;
    marketResolution: boolean;
  };
  theme_preference: 'light' | 'dark' | 'system';
  first_seen?: string;
  last_active?: string;
}

const defaultPreferences: UserPreferences = {
  notification_settings: {
    marketUpdates: true,
    positionAlerts: true,
    marketResolution: true,
  },
  theme_preference: 'system',
};

export function useUserPreferences() {
  const { address, isConnected } = useWalletConnection();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load preferences from backend when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      // Add a small delay to prevent premature API calls
      const timer = setTimeout(() => {
        loadPreferences();
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      // Reset to defaults when disconnected
      setPreferences(defaultPreferences);
    }
  }, [isConnected, address]);

  const loadPreferences = async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await usersApi.getPreferences(address);
      const backendPreferences = response.preferences;

      // Merge with defaults to ensure all fields are present
      const mergedPreferences: UserPreferences = {
        ...defaultPreferences,
        ...backendPreferences,
        notification_settings: {
          ...defaultPreferences.notification_settings,
          ...(backendPreferences.notification_settings || {}),
        },
      };

      setPreferences(mergedPreferences);

      // Also sync to localStorage for offline access
      localStorage.setItem('seti_user_preferences', JSON.stringify(mergedPreferences));
    } catch (err) {
      // Only log error in development, suppress in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load preferences from backend:', err);
      }
      
      // Don't set error state for network issues to prevent premature alerts
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (!errorMessage.includes('Failed to fetch') && !errorMessage.includes('500')) {
        setError('Failed to load preferences');
      }
      
      // Fallback to localStorage if backend fails
      const saved = localStorage.getItem('seti_user_preferences');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setPreferences({ ...defaultPreferences, ...parsed });
        } catch (parseErr) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to parse saved preferences:', parseErr);
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!address) {
      setError('Wallet not connected');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update local state immediately for better UX
      const newPreferences = { ...preferences, ...updates };
      setPreferences(newPreferences);

      // Save to localStorage immediately
      localStorage.setItem('seti_user_preferences', JSON.stringify(newPreferences));

      // Sync to backend
      await usersApi.updatePreferences(address, updates);

      return true;
    } catch (err) {
      console.error('Failed to update preferences:', err);
      setError('Failed to update preferences');
      
      // Revert local state on error
      setPreferences(preferences);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotificationSettings = async (settings: Partial<UserPreferences['notification_settings']>) => {
    return updatePreferences({
      notification_settings: {
        ...preferences.notification_settings,
        ...settings,
      },
    });
  };

  const updateTheme = async (theme: 'light' | 'dark' | 'system') => {
    return updatePreferences({ theme_preference: theme });
  };

  const updateProfile = async (profile: {
    username?: string;
    avatar_url?: string;
    bio?: string;
  }) => {
    return updatePreferences(profile);
  };

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    updateNotificationSettings,
    updateTheme,
    updateProfile,
    loadPreferences,
  };
}
