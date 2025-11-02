"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, RefreshCw, X } from "lucide-react"
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

export function FailedPredictionsNotification() {
  const { isConnected } = useWalletConnection()
  const navigate = useNavigate()
  const [failedPredictions, setFailedPredictions] = useState<FailedPrediction[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  // Load failed predictions from localStorage on mount
  useEffect(() => {
    if (isConnected) {
      const stored = localStorage.getItem('seti_failed_predictions')
      if (stored) {
        try {
          const predictions = JSON.parse(stored).map((p: any) => ({
            ...p,
            failedAt: new Date(p.failedAt)
          }))
          setFailedPredictions(predictions)
          if (predictions.length > 0) {
            setIsVisible(true)
          }
        } catch (error) {
          console.error('Error loading failed predictions:', error)
        }
      }
    }
  }, [isConnected])

  // Check if notification was dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('seti_failed_predictions_dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem('seti_failed_predictions_dismissed', 'true')
  }

  const handleViewFailedPredictions = () => {
    navigate('/failed-predictions')
    handleDismiss()
  }

  const handleRescheduleAll = () => {
    // Clear all failed predictions
    setFailedPredictions([])
    localStorage.removeItem('seti_failed_predictions')
    setIsVisible(false)
    // In a real app, this would retry all predictions
    console.log('Rescheduling all failed predictions...')
  }

  if (!isConnected || failedPredictions.length === 0 || isDismissed || !isVisible) {
    return null
  }

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md mx-4">
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                Failed Predictions
              </h3>
              <Badge variant="secondary" className="bg-orange-200 text-orange-800 text-xs">
                {failedPredictions.length}
              </Badge>
            </div>
            
            <p className="text-xs text-orange-700 dark:text-orange-300 mb-3">
              {failedPredictions.length === 1 
                ? 'You have 1 failed prediction that can be rescheduled.'
                : `You have ${failedPredictions.length} failed predictions that can be rescheduled.`
              }
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleViewFailedPredictions}
                className="h-7 px-3 text-xs bg-orange-600 hover:bg-orange-700 text-white"
              >
                View Details
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleRescheduleAll}
                className="h-7 px-3 text-xs border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Reschedule All
              </Button>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-orange-600 hover:text-orange-800 hover:bg-orange-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
