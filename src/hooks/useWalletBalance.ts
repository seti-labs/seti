import { useBalance } from 'wagmi'
import { formatUnits } from 'viem'
import { useEffect, useRef } from 'react'
import { usersApi } from '@/services/api'

// USDC contract address on Base Sepolia testnet
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const

interface UseWalletBalanceParams {
  address?: `0x${string}`
  isConnected: boolean
}

export function useWalletBalance({ address, isConnected }: UseWalletBalanceParams) {
  // Track if sync is in progress to prevent concurrent syncs
  const syncInProgress = useRef(false)
  
  // Fetch ETH balance from wallet
  const { 
    data: ethBalance, 
    isLoading: isLoadingETH, 
    error: ethError,
    refetch: refetchETH 
  } = useBalance({
    address: address,
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000, // Refetch every 10 seconds (reduced to avoid rate limits)
      retry: 2,
    }
  })
  
  // Fetch USDC balance from wallet
  const { 
    data: usdcBalance, 
    isLoading: isLoadingUSDC, 
    error: usdcError,
    refetch: refetchUSDC 
  } = useBalance({
    address: address,
    token: USDC_ADDRESS,
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000, // Refetch every 10 seconds (reduced to avoid rate limits)
      retry: 2,
    }
  })
  
  // Format balances - always format, but check validity for display priority
  const formattedEthBalance = ethBalance
    ? parseFloat(formatUnits(ethBalance.value, ethBalance.decimals)).toFixed(4)
    : '0.0000'
  
  // Check if USDC balance is valid (exists, has correct symbol, and balance data is available)
  // USDC is the primary currency, so prioritize it for display
  const isValidUsdcBalance = usdcBalance && usdcBalance.symbol === 'USDC' && typeof usdcBalance.value === 'bigint'
  const formattedUsdcBalance = usdcBalance && usdcBalance.symbol === 'USDC'
    ? parseFloat(formatUnits(usdcBalance.value, usdcBalance.decimals)).toFixed(2)
    : '0.00'
  
  const isLoading = isLoadingETH || isLoadingUSDC
  const error = ethError || usdcError
  
  // Auto-detect active currency: USDC is the primary currency used in the app
  // If USDC balance exists and is valid, use USDC; otherwise fall back to ETH
  const activeCurrency = isValidUsdcBalance ? 'USDC' : 'ETH'
  
  // Sync balance to database when balances change (with aggressive debouncing to prevent loops)
  useEffect(() => {
    if (!isConnected || !address || isLoading) return
    
    // Track last sync to prevent excessive calls
    const lastSyncKey = `last_balance_sync_${address}`
    const lastSync = sessionStorage.getItem(lastSyncKey)
    const now = Date.now()
    
    // Only sync if 30 seconds have passed since last sync and no sync is in progress
    // Check BEFORE setting up the timeout to avoid unnecessary timers
    if ((lastSync && (now - parseInt(lastSync)) < 30000) || syncInProgress.current) {
      return
    }
    
    // Mark that we're about to sync (before timeout) to prevent duplicate timers
    syncInProgress.current = true
    
    const syncBalance = async () => {
      try {
        // Only sync if we have actual balance data
        if (!ethBalance && !usdcBalance) {
          return
        }
        
        const usdcAmount = usdcBalance && usdcBalance.symbol === 'USDC'
          ? parseFloat(formatUnits(usdcBalance.value, usdcBalance.decimals))
          : 0
        
        const ethAmount = ethBalance
          ? parseFloat(formatUnits(ethBalance.value, ethBalance.decimals))
          : 0
        
        // Always sync balance (even if 0) to keep backend in sync
        await usersApi.syncBalance(address, {
          usdc: usdcAmount,
          eth: ethAmount,
        })
        
        // Update last sync time on success
        sessionStorage.setItem(lastSyncKey, now.toString())
      } catch (error) {
        // Silently fail on CORS errors - these will flood the console otherwise
        // The backend needs to allow localhost:8080 in CORS_ORIGINS on Render
      } finally {
        // Always reset sync flag
        syncInProgress.current = false
      }
    }
    
    // Debounce sync with longer delay to prevent loops
    const timer = setTimeout(syncBalance, 5000)
    return () => {
      clearTimeout(timer)
      // Reset flag if component unmounts before sync completes
      syncInProgress.current = false
    }
  }, [address, isConnected, isLoading])
  
  return {
    // ETH Balance
    ethBalance: ethBalance?.value || 0n,
    formattedEthBalance,
    ethSymbol: ethBalance?.symbol || 'ETH',
    
    // USDC Balance
    usdcBalance: usdcBalance?.value || 0n,
    formattedUsdcBalance,
    usdcSymbol: usdcBalance?.symbol || 'USDC',
    
    // Status
    isLoading,
    error,
    
    // Refetch functions
    refetch: () => {
      refetchETH()
      refetchUSDC()
    },
    
    // Helper to get display balance - auto-detect active currency (USDC is primary)
    // Always show USDC if available (even if 0), otherwise show ETH
    displayBalance: isValidUsdcBalance ? {
      value: formattedUsdcBalance,
      symbol: 'USDC',
      raw: usdcBalance.value,
      isActiveCurrency: true
    } : ethBalance ? {
      value: formattedEthBalance,
      symbol: 'ETH',
      raw: ethBalance.value,
      isActiveCurrency: false
    } : {
      value: '0.00',
      symbol: 'USDC',
      raw: 0n,
      isActiveCurrency: true
    },
    
    // Active currency indicator
    activeCurrency
  }
}
