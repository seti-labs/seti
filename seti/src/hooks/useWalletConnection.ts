import { useAccount } from 'wagmi'
import { useEffect, useState, useRef } from 'react'
import { useWalletBalance } from './useWalletBalance'

export function useWalletConnection() {
  const { address, isConnected, isConnecting, status } = useAccount()
  const [isReady, setIsReady] = useState(false)
  const [walletError, setWalletError] = useState<string | null>(null)
  const prevStateRef = useRef<string>('')
  
  // Get wallet balance (pass address and isConnected to avoid double useAccount call)
  const { 
    ethBalance, 
    formattedEthBalance, 
    ethSymbol,
    usdcBalance, 
    formattedUsdcBalance, 
    usdcSymbol,
    displayBalance,
    isLoading: isLoadingBalance,
    error: balanceError,
    refetch: refetchBalance
  } = useWalletBalance({ address: address as `0x${string}` | undefined, isConnected })

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
