import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Trophy,
  Target,
  AlertCircle
} from 'lucide-react'
import { apiFetch } from '@/services/api'

interface Prediction {
  id: string
  marketId: string
  marketQuestion: string
  outcome: 'YES' | 'NO'
  amount: number
  price: number
  timestamp: Date
  status: 'pending' | 'success' | 'failed' | 'in_progress'
  currentPrice?: number
  potentialPayout?: number
  actualPayout?: number
  progress?: number
}

interface PredictionTrackerProps {
  prediction: Prediction
  onClose?: () => void
  className?: string
}

export function PredictionTracker({ prediction, onClose, className = "" }: PredictionTrackerProps) {
  const [currentStatus, setCurrentStatus] = useState(prediction.status)
  const [progress, setProgress] = useState(prediction.progress || 0)
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [currentPrice, setCurrentPrice] = useState(prediction.currentPrice || prediction.price)
  const [potentialPayout, setPotentialPayout] = useState(prediction.potentialPayout || 0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch real prediction status from backend
  const fetchPredictionStatus = async () => {
    if (!prediction.id) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await apiFetch(`/tracking/predictions/${prediction.id}/status`)
      if (response.success) {
        const status = response.status
        setCurrentStatus(status.status)
        setProgress(status.progress)
        setCurrentPrice(status.current_price)
        setPotentialPayout(status.potential_payout)
        
        // Calculate time remaining
        if (status.time_remaining !== undefined) {
          const hours = Math.floor(status.time_remaining / 3600)
          const minutes = Math.floor((status.time_remaining % 3600) / 60)
          setTimeRemaining(`${hours}h ${minutes}m`)
        }
      }
    } catch (err) {
      setError('Failed to fetch prediction status')
      console.error('Error fetching prediction status:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch status on mount and periodically
  useEffect(() => {
    fetchPredictionStatus()
    
    // Update every 30 seconds for active predictions
    const interval = setInterval(() => {
      if (currentStatus === 'in_progress' || currentStatus === 'active' || currentStatus === 'early') {
        fetchPredictionStatus()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [prediction.id])

  // Update time remaining display
  useEffect(() => {
    const updateTimeRemaining = () => {
      if (timeRemaining === 'Expired') return
      
      const now = new Date()
      const endTime = new Date(prediction.timestamp.getTime() + 24 * 60 * 60 * 1000) // 24 hours from prediction
      const diff = endTime.getTime() - now.getTime()
      
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        setTimeRemaining(`${hours}h ${minutes}m`)
      } else {
        setTimeRemaining('Expired')
      }
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [prediction.timestamp, timeRemaining])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'in_progress':
      case 'active':
        return <TrendingUp className="w-5 h-5 text-blue-500" />
      case 'early':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'ending_soon':
        return <AlertCircle className="w-5 h-5 text-orange-500" />
      case 'pending_resolution':
        return <Clock className="w-5 h-5 text-purple-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-500 text-white'
      case 'failed':
        return 'bg-red-500 text-white'
      case 'in_progress':
      case 'active':
        return 'bg-blue-500 text-white'
      case 'early':
        return 'bg-yellow-500 text-white'
      case 'ending_soon':
        return 'bg-orange-500 text-white'
      case 'pending_resolution':
        return 'bg-purple-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'RESOLVED'
      case 'failed':
        return 'FAILED'
      case 'in_progress':
      case 'active':
        return 'ACTIVE'
      case 'early':
        return 'EARLY'
      case 'ending_soon':
        return 'ENDING SOON'
      case 'pending_resolution':
        return 'PENDING RESOLUTION'
      default:
        return 'UNKNOWN'
    }
  }

  const calculateProfit = () => {
    if (currentStatus === 'resolved' && potentialPayout) {
      return potentialPayout - prediction.amount
    }
    if (currentStatus === 'failed') {
      return -prediction.amount
    }
    return 0
  }

  const profit = calculateProfit()

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Prediction Tracker
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <XCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Market Question */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <h4 className="font-medium text-sm mb-1">Market</h4>
          <p className="text-sm text-muted-foreground">{prediction.marketQuestion}</p>
        </div>

        {/* Prediction Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-1">Outcome</h4>
            <div className="flex items-center gap-2">
              <Badge 
                className={`text-xs ${
                  prediction.outcome === 'YES' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}
              >
                {prediction.outcome}
              </Badge>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-1">Amount</h4>
            <p className="text-sm font-semibold">{prediction.amount} USDC</p>
          </div>
        </div>

        {/* Current Status */}
        <div className="p-3 bg-muted/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Status</h4>
            <div className="flex items-center gap-2">
              {getStatusIcon(currentStatus)}
              <Badge className={`text-xs ${getStatusColor(currentStatus)}`}>
                {getStatusText(currentStatus)}
              </Badge>
            </div>
          </div>

          {/* Progress Bar for active status */}
          {(currentStatus === 'in_progress' || currentStatus === 'active' || currentStatus === 'early' || currentStatus === 'ending_soon') && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Time Remaining */}
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Time Remaining</span>
            <span>{timeRemaining}</span>
          </div>
        </div>

        {/* Price Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-1">Entry Price</h4>
            <p className="text-sm font-semibold">{prediction.price}¢</p>
          </div>
          
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-1">Current Price</h4>
            <p className="text-sm font-semibold">
              {prediction.currentPrice ? `${prediction.currentPrice.toFixed(1)}¢` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Payout Information */}
        {(currentStatus === 'success' || currentStatus === 'failed') && (
          <div className="p-3 bg-muted/20 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Result</h4>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Payout</span>
              <span className={`text-sm font-semibold ${
                profit >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {profit >= 0 ? '+' : ''}{profit.toFixed(2)} USDC
              </span>
            </div>
          </div>
        )}

        {/* Potential Payout for in_progress */}
        {currentStatus === 'in_progress' && prediction.potentialPayout && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-sm font-medium mb-1">Potential Payout</h4>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {prediction.potentialPayout.toFixed(2)} USDC
            </p>
          </div>
        )}

        {/* Action Button */}
        {currentStatus === 'success' && (
          <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
            <Trophy className="w-4 h-4 mr-2" />
            Claim Winnings
          </Button>
        )}

        {currentStatus === 'failed' && (
          <Button variant="outline" className="w-full">
            <XCircle className="w-4 h-4 mr-2" />
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
