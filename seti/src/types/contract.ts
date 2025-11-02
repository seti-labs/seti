// TypeScript types matching the Ethereum contract structure

// Environment configuration
export const CONTRACT_ADDRESS =
  (import.meta as any).env?.VITE_CONTRACT_ADDRESS ||
  '0x63c0c19a282a1B52b07dD5a65b58948A07DAE32B';
export const MODULE = 'polymarket';

// Market data interface matching the Move struct exactly
export interface MarketData {
  id: string; // Object ID
  question: string;
  description: string;
  end_time: number; // u64 timestamp
  creator: string; // address
  resolved: boolean;
  winning_outcome: number; // 0 = false, 1 = true, 2 = invalid/canceled
  total_liquidity: number; // u64
  outcome_a_shares: number; // Wei converted to number
  outcome_b_shares: number; // Wei converted to number
  liquidity_providers: any; // Bag - complex type, will be handled separately
  volume_24h: number; // u64
  created_timestamp: number; // u64
  category: string;
  image_url: string;
  tags: string[];
}

// Legacy interface for backward compatibility
export interface Market extends MarketData {}

// Hook return types
export interface UseMarketResult {
  data: MarketData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseCreateMarketResult {
  createMarket: (params: CreateMarketParams) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

// Parameters for creating a market
export interface CreateMarketParams {
  question: string;
  description: string;
  endTime: Date | number; // JS Date or Unix timestamp
  category: string;
  imageUrl: string;
  tags: string[];
  initialLiquidityEth: number; // ETH amount (will be converted to Wei)
}

export interface MarketCreated {
  market_id: string; // ID converted to string
  creator: string; // address
  question: string;
  end_time: number; // u64
}

export interface TradeExecuted {
  market_id: string; // ID converted to string
  trader: string; // address
  outcome: number; // 0 or 1
  amount: number; // u64
  price: number; // u64
}

// Helper function to calculate prices from shares
export function calculatePrices(outcome_a_shares: number, outcome_b_shares: number): { yesPrice: number; noPrice: number } {
  const total_shares = outcome_a_shares + outcome_b_shares;
  if (total_shares === 0) {
    return { yesPrice: 50, noPrice: 50 }; // Default 50/50 if no liquidity
  }
  
  const yesPrice = Math.round((outcome_b_shares / total_shares) * 100);
  const noPrice = Math.round((outcome_a_shares / total_shares) * 100);
  
  return { yesPrice, noPrice };
}

// Helper function to format time remaining
export function formatTimeRemaining(endTime: number): string {
  const now = Date.now() / 1000; // Convert to seconds
  const timeLeft = endTime - now;
  
  if (timeLeft <= 0) {
    return "Ended";
  }
  
  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else {
    return `${hours}h`;
  }
}

// Helper function to format volume
export function formatVolume(volume: number | undefined | null): string {
  if (volume === undefined || volume === null || isNaN(volume)) {
    return '0';
  }
  
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(0)}K`;
  } else {
    return volume.toString();
  }
}

// Helper function to format USDC amount (6 decimals)
export function formatUSDC(amount: number | bigint | undefined | null): string {
  if (amount === undefined || amount === null) {
    return '0';
  }
  
  // Convert bigint to number if needed
  let numAmount: number;
  if (typeof amount === 'bigint') {
    // USDC has 6 decimals, so divide by 1_000_000
    numAmount = Number(amount) / 1_000_000;
  } else {
    numAmount = amount;
  }
  
  if (isNaN(numAmount)) {
    return '0';
  }
  
  // Format with appropriate decimals
  if (numAmount >= 1000000) {
    return `$${(numAmount / 1000000).toFixed(2)}M`;
  } else if (numAmount >= 1000) {
    return `$${(numAmount / 1000).toFixed(2)}K`;
  } else if (numAmount >= 1) {
    return `$${numAmount.toFixed(2)}`;
  } else {
    return `$${numAmount.toFixed(4)}`;
  }
}
