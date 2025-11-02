import { useState, useEffect, useCallback } from 'react'
import { predictionsApi } from '@/services/api'

export interface LivePrediction {
  prediction_id: number
  user_address: string
  market_id: number
  market_question: string
  outcome: 'YES' | 'NO'
  amount: number
  shares: number
  timestamp: string
  status: {
    status: string
    message: string
    progress: number
    current_price: number
    potential_payout: number
    is_resolved: boolean
    winning_outcome?: string
    is_winner?: boolean
    profit_loss?: number
    time_remaining?: number
    volume_24h?: number
    total_liquidity?: number
  }
  is_live?: boolean
  is_resolved?: boolean
}

export interface LivePredictionsResponse {
  success: boolean
  predictions: LivePrediction[]
  last_updated?: string
  total_count?: number
  total?: number
  limit?: number
  offset?: number
}

export function useLivePredictions() {
  const [predictions, setPredictions] = useState<LivePrediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchLivePredictions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const data = await predictionsApi.getLive()
      
      if (data.success) {
        setPredictions(data.predictions)
        setLastUpdated(new Date())
      } else {
        setError('Failed to fetch live predictions')
      }
    } catch (err) {
      console.error('Error fetching live predictions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch live predictions')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchActivePredictions = useCallback(async (userAddress?: string, marketId?: number) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const data = await predictionsApi.getActive({ user_address: userAddress, market_id: marketId })
      
      if (data.success) {
        setPredictions(data.predictions)
        setLastUpdated(new Date())
      } else {
        setError('Failed to fetch active predictions')
      }
    } catch (err) {
      console.error('Error fetching active predictions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch active predictions')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchRecentPredictions = useCallback(async (limit = 20) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const data = await predictionsApi.getRecent(limit)
      
      if (data.predictions) {
        setPredictions(data.predictions)
        setLastUpdated(new Date())
      } else {
        setError('Failed to fetch recent predictions')
      }
    } catch (err) {
      console.error('Error fetching recent predictions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch recent predictions')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchLivePredictions()
    
    const interval = setInterval(() => {
      fetchLivePredictions()
    }, 30000) // 30 seconds
    
    return () => clearInterval(interval)
  }, [fetchLivePredictions])

  return {
    predictions,
    isLoading,
    error,
    lastUpdated,
    fetchLivePredictions,
    fetchActivePredictions,
    fetchRecentPredictions,
    refetch: fetchLivePredictions
  }
}

// Hook for user-specific predictions
export function useUserLivePredictions(userAddress: string) {
  const [predictions, setPredictions] = useState<LivePrediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserPredictions = useCallback(async () => {
    if (!userAddress) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const data = await predictionsApi.getActive({ user_address: userAddress })
      
      if (data.success) {
        setPredictions(data.predictions)
      } else {
        setError('Failed to fetch user predictions')
      }
    } catch (err) {
      console.error('Error fetching user predictions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch user predictions')
    } finally {
      setIsLoading(false)
    }
  }, [userAddress])

  useEffect(() => {
    fetchUserPredictions()
    
    const interval = setInterval(() => {
      fetchUserPredictions()
    }, 30000) // 30 seconds
    
    return () => clearInterval(interval)
  }, [fetchUserPredictions])

  return {
    predictions,
    isLoading,
    error,
    refetch: fetchUserPredictions
  }
}
