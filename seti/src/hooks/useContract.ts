import { useState, useCallback } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem'
import { CONTRACT_CONFIG, type ContractMarket, type ContractBet } from '@/config/contract'

// USDC has 6 decimals on Base Sepolia
const USDC_DECIMALS = 6

export function useContract() {
  const { address } = useAccount()
  const { writeContract, isPending, error } = useWriteContract()
  
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Create a new market (admin only)
  const createMarket = useCallback(async (
    question: string,
    description: string,
    endTime: number
  ) => {
    if (!address) {
      setErrorMessage('Please connect your wallet')
      return null
    }

    try {
      setIsLoading(true)
      setErrorMessage(null)

      const hash = await writeContract({
        address: CONTRACT_CONFIG.address as `0x${string}`,
        abi: CONTRACT_CONFIG.abi,
        functionName: 'createMarket',
        args: [question, description, BigInt(endTime)]
      })

      return hash
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create market')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [address, writeContract])

  // Place a bet on a market using USDC
  const placeBet = useCallback(async (
    marketId: string | number,
    outcome: 0 | 1, // 0 = NO, 1 = YES
    amount: string // USDC amount as string
  ) => {
    if (!address) {
      setErrorMessage('Please connect your wallet')
      return null
    }

    try {
      setIsLoading(true)
      setErrorMessage(null)

      // Convert market ID to number
      let numericMarketId: number;
      try {
        if (typeof marketId === 'string') {
          if (marketId.startsWith('0x')) {
            // Convert hex to number
            const hexValue = BigInt(marketId);
            numericMarketId = Number(hexValue % BigInt(Number.MAX_SAFE_INTEGER));
          } else if (marketId.includes('_')) {
            // Extract numeric part from market_123456_0x... format
            const numericMatch = marketId.match(/\d+/);
            if (numericMatch) {
              numericMarketId = parseInt(numericMatch[0]);
            } else {
              throw new Error('No numeric part found in market ID');
            }
          } else {
            numericMarketId = parseInt(marketId);
            if (isNaN(numericMarketId)) {
              throw new Error('Invalid numeric market ID');
            }
          }
        } else {
          numericMarketId = marketId;
        }
      } catch (idError) {
        console.error('Error converting market ID:', idError);
        setErrorMessage('Invalid market ID format');
        return null;
      }

      // Validate amount (0.01 to 10,000 USDC for safety)
      const amountNum = parseFloat(amount)
      if (isNaN(amountNum) || amountNum < 0.01 || amountNum > 10000) {
        setErrorMessage('Invalid amount. Please bet between 0.01 and 10,000 USDC')
        return null
      }

      // For now, we'll use ETH since the contract expects payable
      // TODO: Update contract to handle USDC properly
      // Convert USDC amount to ETH (1 USDC = 1 ETH for now)
      const ethAmount = parseEther(amount)

      console.log('Placing bet with:', { numericMarketId, outcome, amount, ethAmount: ethAmount.toString() });

      const hash = await writeContract({
        address: CONTRACT_CONFIG.address as `0x${string}`,
        abi: CONTRACT_CONFIG.abi,
        functionName: 'placeBet',
        args: [BigInt(numericMarketId), outcome],
        value: ethAmount, // Send ETH for now
        // Let MetaMask estimate gas and gas price for optimal fees
        // This will use the lowest possible fees based on current network conditions
      })

      return hash || 'transaction-submitted'
    } catch (err: any) {
      console.error('Place bet error:', err);
      setErrorMessage(err.message || 'Failed to place bet')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [address, writeContract])

  // Resolve a market (admin only)
  const resolveMarket = useCallback(async (
    marketId: number,
    winningOutcome: 0 | 1
  ) => {
    if (!address) {
      setErrorMessage('Please connect your wallet')
      return null
    }

    try {
      setIsLoading(true)
      setErrorMessage(null)

      const hash = await writeContract({
        address: CONTRACT_CONFIG.address as `0x${string}`,
        abi: CONTRACT_CONFIG.abi,
        functionName: 'resolveMarket',
        args: [BigInt(marketId), winningOutcome]
      })

      return hash
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resolve market')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [address, writeContract])

  // Claim payout for a resolved market
  const claimPayout = useCallback(async (marketId: number) => {
    if (!address) {
      setErrorMessage('Please connect your wallet')
      return null
    }

    try {
      setIsLoading(true)
      setErrorMessage(null)

      const hash = await writeContract({
        address: CONTRACT_CONFIG.address as `0x${string}`,
        abi: CONTRACT_CONFIG.abi,
        functionName: 'claimPayout',
        args: [BigInt(marketId)]
      })

      return hash
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to claim payout')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [address, writeContract])

  return {
    createMarket,
    placeBet,
    resolveMarket,
    claimPayout,
    isLoading: isLoading || isPending,
    error: errorMessage || error?.message,
    isConnected: !!address
  }
}

// Hook to read market data from contract
export function useContractMarket(marketId: number) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: CONTRACT_CONFIG.abi,
    functionName: 'getMarket',
    args: [BigInt(marketId)]
  })

  if (!data) {
    return {
      market: null,
      isLoading,
      error: error?.message,
      refetch
    }
  }

  const [question, description, resolved, winningOutcome, yesPool, noPool, endTime] = data as [
    string, string, boolean, number, bigint, bigint, bigint
  ]

  const market: ContractMarket = {
    question,
    description,
    resolved,
    winningOutcome,
    yesPool,
    noPool,
    endTime
  }

  return {
    market,
    isLoading,
    error: error?.message,
    refetch
  }
}

// Hook to get total number of markets
export function useContractMarketCount() {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: CONTRACT_CONFIG.abi,
    functionName: 'nextMarketId'
  })

  return {
    count: data ? Number(data) : 0,
    isLoading,
    error: error?.message
  }
}

// Utility functions
export const contractUtils = {
  // Convert wei to ETH
  formatEther: (value: bigint) => formatEther(value),
  
  // Convert ETH to wei
  parseEther: (value: string) => parseEther(value),
  
  // Convert USDC small units to USDC amount (6 decimals)
  formatUSDC: (value: bigint) => formatUnits(value, USDC_DECIMALS),
  
  // Convert USDC amount to small units (6 decimals)
  parseUSDC: (value: string) => parseUnits(value, USDC_DECIMALS),
  
  // Calculate prices from pools
  calculatePrices: (yesPool: bigint, noPool: bigint) => {
    const totalPool = yesPool + noPool
    if (totalPool === 0n) {
      return { yesPrice: 0.5, noPrice: 0.5 }
    }
    
    const yesPrice = Number(yesPool) / Number(totalPool)
    const noPrice = Number(noPool) / Number(totalPool)
    
    return { yesPrice, noPrice }
  },
  
  // Check if market is ended
  isMarketEnded: (endTime: bigint) => {
    return BigInt(Math.floor(Date.now() / 1000)) >= endTime
  },
  
  // Get time remaining
  getTimeRemaining: (endTime: bigint) => {
    const now = BigInt(Math.floor(Date.now() / 1000))
    const remaining = endTime - now
    return remaining > 0n ? Number(remaining) : 0
  }
}