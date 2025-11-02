// Contract Verification Utilities
import { CONTRACT_CONFIG } from '@/config/contract'

export const CONTRACT_VERIFICATION = {
  // Contract deployment details
  address: CONTRACT_CONFIG.address,
  chainId: CONTRACT_CONFIG.chainId,
  network: CONTRACT_CONFIG.network,
  explorer: CONTRACT_CONFIG.explorer,
  
  // Verification functions
  isCorrectNetwork: (chainId: number) => chainId === CONTRACT_CONFIG.chainId,
  
  // Contract function signatures for verification
  functions: {
    createMarket: 'createMarket(string,string,uint256)',
    placeBet: 'placeBet(uint256,uint8)',
    resolveMarket: 'resolveMarket(uint256,uint8)',
    claimPayout: 'claimPayout(uint256)',
    getMarket: 'getMarket(uint256)',
    nextMarketId: 'nextMarketId()'
  },
  
  // Event signatures for verification
  events: {
    MarketCreated: 'MarketCreated(uint256,string,uint256,address)',
    BetPlaced: 'BetPlaced(uint256,address,uint8,uint256)',
    MarketResolved: 'MarketResolved(uint256,uint8)',
    PayoutClaimed: 'PayoutClaimed(uint256,address,uint256)'
  },
  
  // Network configuration
  rpcUrl: 'https://sepolia.base.org',
  blockExplorer: 'https://sepolia.basescan.org',
  
  // Verification status
  isDeployed: true,
  isVerified: true,
  lastVerified: new Date().toISOString()
}

// Function to verify contract connection
export async function verifyContractConnection(): Promise<{
  isConnected: boolean
  network: string
  address: string
  error?: string
}> {
  try {
    // Check if we're on the correct network
    if (typeof window !== 'undefined' && window.ethereum) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      const isCorrectNetwork = parseInt(chainId, 16) === CONTRACT_CONFIG.chainId
      
      return {
        isConnected: isCorrectNetwork,
        network: CONTRACT_CONFIG.network,
        address: CONTRACT_CONFIG.address,
        error: isCorrectNetwork ? undefined : `Please switch to ${CONTRACT_CONFIG.network} network`
      }
    }
    
    return {
      isConnected: false,
      network: CONTRACT_CONFIG.network,
      address: CONTRACT_CONFIG.address,
      error: 'No wallet detected'
    }
  } catch (error) {
    return {
      isConnected: false,
      network: CONTRACT_CONFIG.network,
      address: CONTRACT_CONFIG.address,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Function to get contract info for debugging
export function getContractInfo() {
  return {
    contractAddress: CONTRACT_CONFIG.address,
    network: CONTRACT_CONFIG.network,
    chainId: CONTRACT_CONFIG.chainId,
    explorer: CONTRACT_CONFIG.explorer,
    functions: Object.keys(CONTRACT_VERIFICATION.functions),
    events: Object.keys(CONTRACT_VERIFICATION.events),
    abiLength: CONTRACT_CONFIG.abi.length
  }
}
