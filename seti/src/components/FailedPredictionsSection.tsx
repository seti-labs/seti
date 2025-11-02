"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, RefreshCw, Trash2, Calendar } from "lucide-react"
import { useWalletConnection } from "@/hooks/useWalletConnection"

interface FailedPrediction {
  id: string
  marketQuestion: string
  outcome: 'YES' | 'NO'
  amount: number
  failedAt: Date
  reason: 'timeout' | 'insufficient_funds' | 'network_error' | 'user_cancelled'
}

export function FailedPredictionsSection() {
  const { isConnected, address } = useWalletConnection()
  const [failedPredictions, setFailedPredictions] = useState<FailedPrediction[]>([
    // Mock data - in real app, this would come from localStorage or API
    {
      id: '1',
      marketQuestion: 'Will Bitcoin reach $100k by end of 2025?',
      outcome: 'YES',
      amount: 50,
      failedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      reason: 'timeout'
    },
    {
      id: '2', 
      marketQuestion: 'Will Tesla stock reach $300 in 2025?',
      outcome: 'NO',
      amount: 25,
      failedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      reason: 'insufficient_funds'
    }
  ])

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'timeout': return 'Transaction timed out'
      case 'insufficient_funds': return 'Insufficient funds'
      case 'network_error': return 'Network error'
      case 'user_cancelled': return 'Cancelled by user'
      default: return 'Unknown error'
    }
  }

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'timeout': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'insufficient_funds': return 'bg-red-100 text-red-800 border-red-200'
      case 'network_error': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'user_cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleReschedule = (predictionId: string) => {
    // In a real app, this would retry the prediction
    console.log('Rescheduling prediction:', predictionId)
    // Remove from failed list and retry
    setFailedPredictions(prev => prev.filter(p => p.id !== predictionId))
  }

  const handleDelete = (predictionId: string) => {
    setFailedPredictions(prev => prev.filter(p => p.id !== predictionId))
  }

  if (!isConnected || failedPredictions.length === 0) {
    return null
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <RefreshCw className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-foreground">Failed Predictions</h3>
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          {failedPredictions.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {failedPredictions.map((prediction) => (
          <Card key={prediction.id} className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium text-foreground line-clamp-2">
                    {prediction.marketQuestion}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1">
                    Failed {prediction.failedAt.toLocaleString()}
                  </CardDescription>
                </div>
                <Badge className={`text-xs ${getReasonColor(prediction.reason)}`}>
                  {getReasonText(prediction.reason)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Outcome:</span>
                    <span className={`font-medium ${
                      prediction.outcome === 'YES' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {prediction.outcome}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">${prediction.amount} USDC</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReschedule(prediction.id)}
                    className="h-8 px-3 text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Reschedule
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(prediction.id)}
                    className="h-8 px-3 text-xs bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
