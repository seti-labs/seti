/**
 * Frontend Contract Service - Uses same contract service as backend
 * No duplication, no over-engineering
 */

// Contract configuration - matches backend
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x63c0c19a282a1B52b07dD5a65b58948A07DAE32B'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'

export class ContractService {
  private apiUrl: string

  constructor() {
    this.apiUrl = API_URL
  }

  // Get all markets from backend (which uses the same contract service)
  async getAllMarkets() {
    try {
      const response = await fetch(`${this.apiUrl}/markets`)
      const data = await response.json()
      return data.markets || []
    } catch (error) {
      console.error('Error fetching markets:', error)
      return []
    }
  }

  // Get single market from backend
  async getMarket(marketId: string) {
    try {
      const response = await fetch(`${this.apiUrl}/markets/${marketId}`)
      const data = await response.json()
      return data.market || null
    } catch (error) {
      console.error(`Error fetching market ${marketId}:`, error)
      return null
    }
  }

  // Get user's predictions from backend
  async getUserPredictions(userAddress: string) {
    try {
      const response = await fetch(`${this.apiUrl}/predictions?user_address=${userAddress}`)
      const data = await response.json()
      return data.predictions || []
    } catch (error) {
      console.error('Error fetching user predictions:', error)
      return []
    }
  }

  // Create prediction (calls backend API)
  async createPrediction(predictionData: {
    market_id: string
    user_address: string
    outcome: number
    amount: number
    transaction_hash: string
  }) {
    try {
      const response = await fetch(`${this.apiUrl}/predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(predictionData)
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creating prediction:', error)
      throw error
    }
  }

  // Calculate prices (same logic as backend)
  calculatePrices(yesPool: number, noPool: number) {
    const totalLiquidity = yesPool + noPool
    if (totalLiquidity === 0) {
      return { yes_price: 50, no_price: 50 }
    }
    
    const yesPrice = Math.round((yesPool / totalLiquidity) * 100)
    const noPrice = Math.round((noPool / totalLiquidity) * 100)
    
    return { yes_price: yesPrice, no_price: noPrice }
  }

  // Check if market is active
  isMarketActive(endTime: number) {
    return Date.now() / 1000 < endTime
  }

  // Get market status
  getMarketStatus(market: any) {
    if (market.resolved) return 'resolved'
    if (!this.isMarketActive(market.end_time)) return 'ended'
    return 'active'
  }
}

// Export singleton instance
export const contractService = new ContractService()
