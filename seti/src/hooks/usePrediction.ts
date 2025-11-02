import React, { useState } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { useContract } from './useContract';
import { contractService } from '../services/contract';

export interface PredictionParams {
  marketId: string;
  outcome: 'YES' | 'NO';
  amount: number; // in USDC
}

export interface StoredPrediction {
  id: string;
  marketId: string;
  marketQuestion?: string;
  marketCategory?: string;
  outcome: 'YES' | 'NO';
  amount: number;
  price?: number;
  timestamp: number;
  status?: 'active' | 'closed' | 'won' | 'lost';
}

// Local storage functions
export const savePredictions = (predictions: StoredPrediction[]) => {
  try {
    const existing = getPredictions();
    const updated = [...existing, ...predictions];
    localStorage.setItem('user_predictions', JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save predictions:', error);
  }
};

export const getPredictions = (): StoredPrediction[] => {
  try {
    const stored = localStorage.getItem('user_predictions');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load predictions:', error);
    return [];
  }
};

export const getPredictionById = (id: string): StoredPrediction | null => {
  try {
    const predictions = getPredictions();
    return predictions.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Failed to get prediction by id:', error);
    return null;
  }
};

export function usePrediction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const { address, isConnected } = useAccount();
  const { placeBet } = useContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash!,
  });

  // Reset txHash when transaction is confirmed or failed
  React.useEffect(() => {
    if (isSuccess || (txHash && !isConfirming && !isSuccess)) {
      setTxHash(null);
    }
  }, [isSuccess, isConfirming, txHash]);

  const placePrediction = async (params: PredictionParams): Promise<boolean> => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Placing prediction on smart contract:', params);
      
      // Convert outcome to number (0 = NO, 1 = YES)
      const outcome = params.outcome === 'YES' ? 1 : 0;
      
      // Convert market ID to numeric format for smart contract
      let numericMarketId: number;
      try {
        // Handle different market ID formats
        if (params.marketId.startsWith('0x')) {
          // Hex string: convert to BigInt then to number (with safe bounds)
          const hexValue = BigInt(params.marketId);
          // Ensure it fits in a safe integer range for the contract
          numericMarketId = Number(hexValue % BigInt(Number.MAX_SAFE_INTEGER));
        } else if (params.marketId.includes('_')) {
          // String format like "game_1002_1761526161": extract the first number
          const numericMatch = params.marketId.match(/\d+/);
          if (numericMatch) {
            numericMarketId = parseInt(numericMatch[0]);
          } else {
            throw new Error('No numeric part found in market ID');
          }
        } else {
          // Direct numeric string
          numericMarketId = parseInt(params.marketId);
          if (isNaN(numericMarketId)) {
            throw new Error('Invalid numeric market ID');
          }
        }
      } catch (idError) {
        console.error('Error converting market ID:', idError);
        setError('Invalid market ID format');
        return false;
      }
      
      console.log('Using numeric market ID:', numericMarketId);
      
      // Call smart contract placeBet function using USDC amount
      const result = await placeBet(
        numericMarketId,
        outcome as 0 | 1,
        params.amount.toString()
      );

      if (result) {
        console.log('Transaction submitted:', result);
        // Set the transaction hash for confirmation tracking
        setTxHash(result as `0x${string}`);
        
        // Wait for transaction confirmation
        console.log('Waiting for transaction confirmation...');
        
        // Create a promise that resolves when transaction is confirmed
        return new Promise<boolean>((resolve) => {
          const checkConfirmation = () => {
            if (isSuccess) {
              console.log('Transaction confirmed!');
              resolve(true);
            } else if (txHash && !isConfirming && !isSuccess) {
              console.log('Transaction failed');
              resolve(false);
            } else {
              // Still waiting, check again in 100ms
              setTimeout(checkConfirmation, 100);
            }
          };
          checkConfirmation();
        });
      }
      
      return false;
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err instanceof Error ? err.message : 'Failed to place prediction');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    placePrediction,
    isLoading: isLoading || isConfirming,
    error: error,
    isConnected,
    hash: txHash,
    isSuccess,
  };
}

// Helper function to get user's prediction statistics
export function useUserPredictionStats() {
  const predictions = getPredictions();
  
  const active = predictions.filter(p => p.status === 'active' || !p.status);
  const closed = predictions.filter(p => p.status === 'closed');
  const won = predictions.filter(p => p.status === 'won');
  const lost = predictions.filter(p => p.status === 'lost');
  
  const activeValue = active.reduce((sum, p) => sum + p.amount, 0);
  const totalWon = won.reduce((sum, p) => sum + p.amount, 0);
  const totalLost = lost.reduce((sum, p) => sum + p.amount, 0);
  
  return {
    totalPredictions: predictions.length,
    activePredictions: active.length,
    closedPredictions: closed.length,
    wonPredictions: won.length,
    lostPredictions: lost.length,
    activeValue,
    totalWon,
    totalLost,
    winRate: predictions.length > 0 ? (won.length / predictions.length) * 100 : 0,
  };
}