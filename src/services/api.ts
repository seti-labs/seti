/**
 * API Service for connecting to Seti Backend
 * Web2.5 Architecture: Fast backend queries + Blockchain settlement
 * Uses single contract service - no duplication
 * SECURE: Enhanced with comprehensive security measures
 */

import { contractService } from './contract'

// Always use remote backend - localhost is not supported
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://seti-backend.onrender.com/api/v1';

// Development-only logging
if (import.meta.env.DEV) {
  console.log('API_BASE_URL configured as:', API_BASE_URL);
  if (API_BASE_URL.includes('localhost')) {
    console.warn('⚠️ WARNING: Using localhost backend. Update your .env file to use remote backend:', 'VITE_API_URL=https://seti-backend.onrender.com/api/v1');
  }
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Simple rate limiting implementation
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}

// Initialize rate limiting
const rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

// Generic fetch wrapper with enhanced security
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    // Rate limiting check
    const clientId = 'api_client'; // In production, use user ID or session ID
    if (!rateLimiter.isAllowed(clientId)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Validate endpoint to prevent SSRF
    if (!isValidEndpoint(endpoint)) {
      throw new Error('Invalid endpoint');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Validate endpoint to prevent SSRF attacks
function isValidEndpoint(endpoint: string): boolean {
  // Only allow relative paths and specific patterns
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return false; // Block absolute URLs
  }
  
  if (endpoint.includes('..') || endpoint.includes('//')) {
    return false; // Block path traversal
  }
  
  return true;
}

// Markets API
export const marketsApi = {
  // Get all markets with optional filters
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    category?: string;
    status?: 'active' | 'resolved';
    sort_by?: 'volume_24h' | 'total_liquidity' | 'created_timestamp';
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    const query = queryParams.toString();
    return apiFetch<{
      markets: any[];
      pagination: {
        page: number;
        per_page: number;
        total: number;
        pages: number;
        has_next: boolean;
        has_prev: boolean;
      };
    }>(`/markets${query ? `?${query}` : ''}`);
  },

  // Get single market by ID
  getById: async (id: string) => {
    return apiFetch<{ market: any }>(`/markets/${id}`);
  },

  // Get featured markets
  getFeatured: async () => {
    return apiFetch<{ markets: any[] }>('/markets/featured');
  },

  // Get market categories
  getCategories: async () => {
    return apiFetch<{ categories: Array<{ name: string; count: number }> }>('/markets/categories');
  },

  // Sync markets from blockchain (admin)
  sync: async () => {
    return apiFetch<{ message: string; synced_count: number }>('/markets/sync', {
      method: 'POST',
    });
  },
};

// Predictions API
export const predictionsApi = {
  // Get all predictions with filters
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    market_id?: string;
    user_address?: string;
    outcome?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    const query = queryParams.toString();
    return apiFetch<{
      predictions: any[];
      pagination: any;
    }>(`/predictions${query ? `?${query}` : ''}`);
  },

  // Create new prediction (after blockchain transaction)
  create: async (data: {
    transaction_hash: string;
    market_id: string;
    user_address: string;
    outcome: number;
    amount: number;
    price?: number;
    shares?: number;
    timestamp: number;
  }) => {
    return apiFetch<{ message: string; prediction: any }>('/predictions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get recent predictions
  getRecent: async (limit: number = 50) => {
    return apiFetch<{ predictions: any[] }>(`/predictions/recent?limit=${limit}`);
  },

  // Live Predictions API methods
  // Get live predictions
  getLive: (params?: { limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.offset) searchParams.append('offset', params.offset.toString())
    
    return apiFetch<{
      success: boolean
      predictions: any[]
      last_updated: string
      total_count: number
    }>(`/predictions/live?${searchParams.toString()}`)
  },
  
  // Get active predictions
  getActive: (params?: { 
    user_address?: string
    market_id?: number
    limit?: number
    offset?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.user_address) searchParams.append('user_address', params.user_address)
    if (params?.market_id) searchParams.append('market_id', params.market_id.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.offset) searchParams.append('offset', params.offset.toString())
    
    return apiFetch<{
      success: boolean
      predictions: any[]
      total: number
      limit: number
      offset: number
    }>(`/predictions/active?${searchParams.toString()}`)
  },
  
  // Get prediction status
  getStatus: (predictionId: number) =>
    apiFetch<{
      success: boolean
      prediction_id: number
      status: any
    }>(`/predictions/${predictionId}/status`),
  
  // Get user predictions status
  getUserStatus: (userAddress: string) =>
    apiFetch<{
      success: boolean
      user_address: string
      predictions: any[]
    }>(`/users/${userAddress}/predictions/status`),
  
  // Get market analytics
  getMarketAnalytics: (marketId: number) =>
    apiFetch<{
      success: boolean
      analytics: any
    }>(`/markets/${marketId}/analytics`),
};

// Users API
export const usersApi = {
  // Get user profile
  getProfile: async (address: string) => {
    return apiFetch<{ user: any }>(`/users/${address}`);
  },

  // Update user profile
  updateProfile: async (address: string, data: {
    username?: string;
    avatar_url?: string;
    bio?: string;
  }) => {
    return apiFetch<{ message: string; user: any }>(`/users/${address}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Get user preferences (new endpoint)
  getPreferences: async (address: string) => {
    return apiFetch<{ preferences: any }>(`/users/${address}/preferences`);
  },

  // Update user preferences (new endpoint)
  updatePreferences: async (address: string, data: {
    username?: string;
    avatar_url?: string;
    bio?: string;
    notification_settings?: any;
    theme_preference?: string;
  }) => {
    return apiFetch<{ message: string; preferences: any }>(`/users/${address}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Get user predictions
  getPredictions: async (address: string, page: number = 1, per_page: number = 20) => {
    return apiFetch<{
      predictions: any[];
      pagination: any;
    }>(`/users/${address}/predictions?page=${page}&per_page=${per_page}`);
  },

  // Get user stats
  getStats: async (address: string) => {
    return apiFetch<{ stats: any }>(`/users/${address}/stats`);
  },

  // Get user balance (synced from database)
  getBalance: async (address: string) => {
    return apiFetch<{ 
      balance: {
        usdc?: number;
        eth?: number;
        last_synced: string;
      }
    }>(`/users/${address}/balance`);
  },

  // Sync user balance to database
  syncBalance: async (address: string, balance: {
    usdc?: number;
    eth?: number;
  }) => {
    return apiFetch<{ message: string; balance: any }>(`/users/${address}/balance`, {
      method: 'POST',
      body: JSON.stringify(balance),
    });
  },

  // Get user notifications
  getNotifications: async (address: string, params?: {
    page?: number;
    per_page?: number;
    unread_only?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    const query = queryParams.toString();
    return apiFetch<{
      notifications: any[];
      pagination: any;
    }>(`/users/${address}/notifications${query ? `?${query}` : ''}`);
  },

  // Get leaderboard
  getLeaderboard: async (params?: {
    sort_by?: 'total_volume' | 'total_predictions';
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    const query = queryParams.toString();
    return apiFetch<{ leaderboard: any[] }>(`/users/leaderboard${query ? `?${query}` : ''}`);
  },
};

// Favorites API
export const favoritesApi = {
  // Get user favorites
  getUserFavorites: async (address: string, page: number = 1, per_page: number = 20) => {
    return apiFetch<{
      favorites: any[];
      pagination: any;
    }>(`/favorites/${address}?page=${page}&per_page=${per_page}`);
  },

  // Add favorite
  addFavorite: async (address: string, marketId: string) => {
    return apiFetch<{ message: string; favorite: any }>(`/favorites/${address}/${marketId}`, {
      method: 'POST',
    });
  },

  // Remove favorite
  removeFavorite: async (address: string, marketId: string) => {
    return apiFetch<{ message: string }>(`/favorites/${address}/${marketId}`, {
      method: 'DELETE',
    });
  },

  // Check if favorited
  checkFavorite: async (address: string, marketId: string) => {
    return apiFetch<{ is_favorite: boolean; favorite_id: number | null }>(`/favorites/${address}/${marketId}`);
  },

  // Toggle favorite
  toggleFavorite: async (address: string, marketId: string) => {
    return apiFetch<{ message: string; is_favorite: boolean; favorite?: any }>(`/favorites/${address}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ market_id: marketId }),
    });
  },
};

// Analytics API
export const analyticsApi = {
  // Get platform overview
  getOverview: async () => {
    return apiFetch<{
      overview: {
        total_markets: number;
        active_markets: number;
        resolved_markets: number;
        total_volume: number;
        total_liquidity: number;
        total_predictions: number;
        total_users: number;
        active_users_7d: number;
      };
    }>('/analytics/overview');
  },

  // Get top markets
  getTopMarkets: async (metric: string = 'volume', limit: number = 10) => {
    return apiFetch<{ markets: any[] }>(`/analytics/markets/top?metric=${metric}&limit=${limit}`);
  },

  // Get category stats
  getCategoryStats: async () => {
    return apiFetch<{
      categories: Array<{
        category: string;
        market_count: number;
        total_volume: number;
        total_liquidity: number;
      }>;
    }>('/analytics/categories/stats');
  },

  // Get recent activity
  getRecentActivity: async (limit: number = 20) => {
    return apiFetch<{ activity: any[] }>(`/analytics/activity/recent?limit=${limit}`);
  },
};

// Helper to sync blockchain transaction to backend
export async function syncTransactionToBackend(txData: {
  type: 'prediction' | 'market_created' | 'liquidity_added';
  transaction_hash: string;
  data: any;
}) {
  try {
    switch (txData.type) {
      case 'prediction':
        return await predictionsApi.create({
          transaction_hash: txData.transaction_hash,
          market_id: txData.data.market_id,
          user_address: txData.data.user_address,
          outcome: txData.data.outcome,
          amount: txData.data.amount,
          price: txData.data.price,
          shares: txData.data.shares,
          timestamp: Math.floor(Date.now() / 1000),
        });
      
      // Add other transaction types as needed
      default:
        console.warn(`Unhandled transaction type: ${txData.type}`);
    }
  } catch (error) {
    console.error('Failed to sync transaction to backend:', error);
    // Don't throw - let the blockchain transaction succeed even if backend sync fails
  }
}

// Games API
export const gamesApi = {
  // Get all games
  getAll: async (params?: {
    league?: string;
    status?: 'scheduled' | 'live' | 'finished';
    league_id?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    const query = queryParams.toString();
    return apiFetch<{ games: any[]; count: number }>(`/games${query ? `?${query}` : ''}`);
  },

  // Get single game
  getById: async (fixtureId: number) => {
    return apiFetch<{ game: any }>(`/games/${fixtureId}`);
  },

  // Get leagues
  getLeagues: async () => {
    return apiFetch<{ leagues: any[] }>('/games/leagues');
  },

  // Sync games from RapidAPI
  sync: async () => {
    return apiFetch<{ message: string; synced: number; total: number }>('/games/sync', {
      method: 'POST',
    });
  },
};

// Countries API
export const countriesApi = {
  // Get all countries
  getAll: async () => {
    return apiFetch<{ countries: any[]; count: number }>('/countries');
  },
};

// Sports API
export const sportsApi = {
  // Get live sports scores
  getLiveScores: async () => {
    return apiFetch<{
      success: boolean;
      live_scores: Array<{
        market_id: string;
        home_team: string;
        away_team: string;
        league: string;
        home_score: number;
        away_score: number;
        game_status: string;
        venue?: string;
        last_updated: string;
      }>;
      count: number;
      last_updated: string;
    }>('/sports/live-scores');
  },

  // Get upcoming games
  getUpcomingGames: async (params?: {
    league?: string;
    hours_ahead?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.league) queryParams.append('league', params.league);
    if (params?.hours_ahead) queryParams.append('hours_ahead', params.hours_ahead.toString());
    
    const query = queryParams.toString();
    return apiFetch<{
      success: boolean;
      games: Array<{
        market_id: string;
        home_team: string;
        away_team: string;
        league: string;
        kickoff_time: number;
        venue?: string;
        odds?: { home: number; away: number; draw?: number };
        market_confidence: number;
        arbitrage_opportunity: boolean;
        team_logos?: { home: string; away: string };
      }>;
      count: number;
      league?: string;
      hours_ahead: number;
    }>(`/sports/upcoming-games${query ? `?${query}` : ''}`);
  },

  // Get available leagues
  getLeagues: async () => {
    return apiFetch<{
      success: boolean;
      leagues: Array<{ name: string; count: number }>;
      count: number;
    }>('/sports/leagues');
  },

  // Get team statistics
  getTeamStats: async (teamName: string) => {
    return apiFetch<{
      success: boolean;
      stats: {
        team_name: string;
        total_markets: number;
        resolved_markets: number;
        wins: number;
        losses: number;
        draws: number;
        win_rate: number;
        recent_form: string[];
        last_updated: string;
      };
    }>(`/sports/team-stats/${encodeURIComponent(teamName)}`);
  },

  // Get market intelligence
  getMarketIntelligence: async () => {
    return apiFetch<{
      success: boolean;
      arbitrage_opportunities: Array<{
        market_id: string;
        question: string;
        home_team: string;
        away_team: string;
        odds: { home: number; away: number; draw?: number };
        total_probability: number;
        potential_profit: number;
        confidence: number;
      }>;
      trending_markets: Array<{
        market_id: string;
        question: string;
        home_team: string;
        away_team: string;
        trending_score: number;
        volume_24h: number;
        participant_count: number;
      }>;
      last_updated: string;
    }>('/sports/market-intelligence');
  },

  // Sync sports data
  sync: async () => {
    return apiFetch<{
      success: boolean;
      message: string;
      timestamp: string;
    }>('/sports/sync', {
      method: 'POST',
    });
  },

  // Get sync status
  getStatus: async () => {
    return apiFetch<{
      success: boolean;
      sync_status: {
        running: boolean;
        sync_interval: number;
        thread_alive: boolean;
      };
      timestamp: string;
    }>('/sports/status');
  },
};

export default {
  markets: marketsApi,
  predictions: predictionsApi,
  users: usersApi,
  analytics: analyticsApi,
  favorites: favoritesApi,
  games: gamesApi,
  countries: countriesApi,
  sports: sportsApi,
  syncTransaction: syncTransactionToBackend,
};

