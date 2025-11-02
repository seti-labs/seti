import { useBalance } from 'wagmi'
import { formatUnits } from 'viem'

// USDC contract address on Base Sepolia testnet
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const

interface UseWalletBalanceParams {
  address?: `0x${string}`
  isConnected: boolean
}

export function useWalletBalance({ address, isConnected }: UseWalletBalanceParams) {
  
  // Fetch ETH balance
  const { 
    data: ethBalance, 
    isLoading: isLoadingETH, 
    error: ethError,
    refetch: refetchETH 
  } = useBalance({
    address: address,
    enabled: isConnected && !!address,
  })
  
  // Fetch USDC balance
  const { 
    data: usdcBalance, 
    isLoading: isLoadingUSDC, 
    error: usdcError,
    refetch: refetchUSDC 
  } = useBalance({
    address: address,
    token: USDC_ADDRESS,
    enabled: isConnected && !!address,
  })
  
  // Format balances
  const formattedEthBalance = ethBalance 
    ? parseFloat(formatUnits(ethBalance.value, ethBalance.decimals)).toFixed(4)
    : '0.0000'
  
  const formattedUsdcBalance = usdcBalance
    ? parseFloat(formatUnits(usdcBalance.value, usdcBalance.decimals)).toFixed(2)
    : '0.00'
  
  const isLoading = isLoadingETH || isLoadingUSDC
  const error = ethError || usdcError
  
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
    
    // Helper to get display balance (priority: USDC > ETH)
    displayBalance: usdcBalance ? {
      value: formattedUsdcBalance,
      symbol: 'USDC',
      raw: usdcBalance.value
    } : ethBalance ? {
      value: formattedEthBalance,
      symbol: 'ETH',
      raw: ethBalance.value
    } : null
  }
}
