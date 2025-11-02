"use client"

import { useState, useEffect } from "react"
import { Layout } from "@/components/Layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, RefreshCw, Trash2, ArrowLeft, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useWalletConnection } from "@/hooks/useWalletConnection"

interface FailedPrediction {
  id: string
  marketQuestion: string
  outcome: 'YES' | 'NO'
  amount: number
  failedAt: Date
  reason: 'timeout' | 'insufficient_funds' | 'network_error' | 'user_cancelled'
}

export default function FailedPredictions() {
  const { isConnected, address } = useWalletConnection()
  const navigate = useNavigate()
  const [failedPredictions, setFailedPredictions] = useState<FailedPrediction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load failed predictions from localStorage
  useEffect(() => {
    const loadFailedPredictions = () => {
      try {
        const stored = localStorage.getItem('seti_failed_predictions')
        if (stored) {
          const predictions = JSON.parse(stored).map((p: any) => ({
            ...p,
            failedAt: new Date(p.failedAt)
          }))
          setFailedPredictions(predictions)
        }
      } catch (error) {
        console.error('Error loading failed predictions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFailedPredictions()
  }, [])

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
    setFailedPredictions(prev => {
      const updated = prev.filter(p => p.id !== predictionId)
      localStorage.setItem('seti_failed_predictions', JSON.stringify(updated))
      return updated
    })
  }

  const handleDelete = (predictionId: string) => {
    setFailedPredictions(prev => {
      const updated = prev.filter(p => p.id !== predictionId)
      localStorage.setItem('seti_failed_predictions', JSON.stringify(updated))
      return updated
    })
  }

  const handleRescheduleAll = () => {
    // In a real app, this would retry all predictions
    console.log('Rescheduling all failed predictions...')
    setFailedPredictions([])
    localStorage.removeItem('seti_failed_predictions')
  }

  const handleClearAll = () => {
    setFailedPredictions([])
    localStorage.removeItem('seti_failed_predictions')
  }

  if (!isConnected) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Wallet Not Connected</h2>
            <p className="text-muted-foreground mb-6">Please connect your wallet to view failed predictions.</p>
            <Button onClick={() => navigate('/')}>
              Go to Home
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading failed predictions...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Markets
            </Button>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">Failed Predictions</h1>
              <p className="text-muted-foreground mt-1">
                Manage your failed prediction attempts and reschedule them
              </p>
            </div>
            
            {failedPredictions.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleRescheduleAll}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reschedule All
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </Button>
              </div>
            )}
          </div>

          {/* Failed Predictions List */}
          {failedPredictions.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Failed Predictions</h3>
              <p className="text-muted-foreground mb-6">
                You don't have any failed predictions at the moment.
              </p>
              <Button onClick={() => navigate('/')}>
                Go to Markets
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {failedPredictions.map((prediction) => (
                <Card key={prediction.id} className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-medium text-foreground line-clamp-2">
                          {prediction.marketQuestion}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground mt-1">
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
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Outcome:</span>
                          <span className={`font-medium ${
                            prediction.outcome === 'YES' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {prediction.outcome}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-medium">${prediction.amount} USDC</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
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
          )}
        </div>
      </div>
    </Layout>
  )
}
