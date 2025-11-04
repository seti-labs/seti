import { useAccount } from 'wagmi'
import { useEffect, useState, useRef } from 'react'
import { useWalletBalance } from './useWalletBalance'
import { usersApi } from '@/services/api'

export function useWalletConnection() {
  const { address, isConnected, isConnecting, status } = useAccount()
  const [isReady, setIsReady] = useState(false)
  const [walletError, setWalletError] = useState<string | null>(null)
  const prevStateRef = useRef<string>('')
  const [backendBalance, setBackendBalance] = useState<{ usdc?: number; eth?: number } | null>(null)
  
  // Get wallet balance (pass address and isConnected to avoid double useAccount call)
  const { 
    ethBalance, 
    formattedEthBalance, 
    ethSymbol,
    usdcBalance, 
    formattedUsdcBalance, 
    usdcSymbol,
    displayBalance: onChainDisplayBalance,
    isLoading: isLoadingBalance,
    error: balanceError,
    refetch: refetchBalance
  } = useWalletBalance({ address: address as `0x${string}` | undefined, isConnected })
  
  // Fetch backend balance (what's saved in the app)
  useEffect(() => {
    if (!isConnected || !address) {
      setBackendBalance(null)
      return
    }
    
    const fetchBackendBalance = async () => {
      try {
        const response = await usersApi.getBalance(address)
        if (response && response.balance) {
          setBackendBalance(response.balance)
        }
      } catch (error) {
        // If backend fails, we'll use on-chain balance
        setBackendBalance(null)
      }
    }
    
    fetchBackendBalance()
    
    // Refetch every 30 seconds
    const interval = setInterval(fetchBackendBalance, 30000)
    return () => clearInterval(interval)
  }, [address, isConnected])
  
  // Display balance: prefer backend balance (what's in the app) over on-chain
  const displayBalance = backendBalance && (backendBalance.usdc !== undefined || backendBalance.eth !== undefined)
    ? {
        value: backendBalance.usdc 
          ? backendBalance.usdc.toFixed(2) 
          : backendBalance.eth?.toFixed(4) || '0.00',
        symbol: backendBalance.usdc !== undefined ? 'USDC' : 'ETH',
        raw: BigInt(0),
        isActiveCurrency: true
      }
    : onChainDisplayBalance

  useEffect(() => {
    // Give a small delay to ensure wallet state is properly initialized
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Handle wallet connection errors
  useEffect(() => {
    if (status === 'disconnected' && !isConnecting) {
      // Check if MetaMask is available
      if (typeof window !== 'undefined' && !window.ethereum) {
        setWalletError('MetaMask not detected. Please install MetaMask to continue.')
      } else {
        setWalletError(null)
      }
    } else if (isConnected) {
      setWalletError(null)
    }
  }, [status, isConnecting, isConnected])

  // Debug logging - only log when state actually changes
  useEffect(() => {
    if (isReady) {
      const currentState = `${isConnected}-${address}-${isConnecting}-${status}`
      if (currentState !== prevStateRef.current) {
        // Only log state changes, not every render
        prevStateRef.current = currentState
      }
    }
  }, [isConnected, address, isConnecting, isReady, status])

  // Determine if we're actually connecting or just in a pending state
  const actuallyConnecting = isConnecting && status === 'connecting'
  const isDisconnected = !isConnected && !actuallyConnecting
  
  // Handle reconnecting state more gracefully
  const isReconnecting = status === 'reconnecting'
  const isStable = status === 'connected' || status === 'disconnected'

  return {
    isConnected,
    address,
    isConnecting: actuallyConnecting,
    isDisconnected,
    isReady,
    isReconnecting,
    isStable,
    // Helper to check if we should show wallet connection prompt
    shouldShowConnectPrompt: isReady && !actuallyConnecting && !isConnected && !isReconnecting,
    // Helper to check if wallet is ready and connected
    isWalletReady: isReady && isConnected && !!address && isStable,
    // Balance data
    ethBalance,
    formattedEthBalance,
    ethSymbol,
    usdcBalance,
    formattedUsdcBalance,
    usdcSymbol,
    displayBalance,
    isLoadingBalance,
    balanceError,
    refetchBalance,
    // Wallet error
    walletError
  }
}
