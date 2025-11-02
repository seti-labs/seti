import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react'
import { useLivePredictions, LivePrediction } from '@/hooks/useLivePredictions'
import { formatDistanceToNow } from 'date-fns'

interface LivePredictionsFeedProps {
  limit?: number
  showRefresh?: boolean
  className?: string
}

export function LivePredictionsFeed({ 
  limit = 10, 
  showRefresh = true, 
  className = '' 
}: LivePredictionsFeedProps) {
  const { 
    predictions, 
    isLoading, 
    error, 
    lastUpdated, 
    refetch 
  } = useLivePredictions()

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'ending_soon':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'pending_resolution':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getOutcomeIcon = (outcome: 'YES' | 'NO') => {
    return outcome === 'YES' ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    )
  }

  const getOutcomeColor = (outcome: 'YES' | 'NO') => {
    return outcome === 'YES' 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400'
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Live Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">
              Failed to load predictions
            </p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Live Predictions
            {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
          </CardTitle>
          {showRefresh && (
            <Button 
              onClick={refetch} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
        {lastUpdated && (
          <p className="text-sm text-muted-foreground">
            Last updated: {formatDistanceToNow(lastUpdated)} ago
          </p>
        )}
      </CardHeader>
      <CardContent>
        {isLoading && predictions.length === 0 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : predictions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No predictions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {predictions.slice(0, limit).map((prediction) => (
              <div 
                key={prediction.prediction_id} 
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getOutcomeIcon(prediction.outcome)}
                    <span className={`font-medium ${getOutcomeColor(prediction.outcome)}`}>
                      {prediction.outcome}
                    </span>
                    <Badge className={getStatusColor(prediction.status.status)}>
                      {prediction.status.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(prediction.timestamp))} ago
                  </div>
                </div>
                
                <h4 className="font-medium text-sm mb-2 line-clamp-2">
                  {prediction.market_question}
                </h4>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      <span className="font-medium">
                        {formatAmount(prediction.amount)}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      {prediction.status.current_price.toFixed(1)}% odds
                    </div>
                  </div>
                  
                  {prediction.status.potential_payout > 0 && (
                    <div className="text-green-600 dark:text-green-400 font-medium">
                      +{formatAmount(prediction.status.potential_payout)}
                    </div>
                  )}
                </div>
                
                {prediction.status.progress > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{prediction.status.progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                      <div 
                        className="bg-primary h-1 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(prediction.status.progress, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
