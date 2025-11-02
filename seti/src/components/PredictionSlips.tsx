import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Receipt, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from "lucide-react"
import { useWalletConnection } from '@/hooks/useWalletConnection'

interface PredictionSlip {
  id: string
  marketId: string
  marketQuestion: string
  outcome: 'YES' | 'NO'
  amount: number
  price: number
  shares: number
  timestamp: number
  status: 'pending' | 'confirmed' | 'resolved'
  winningOutcome?: 'YES' | 'NO'
  payout?: number
}

export function PredictionSlips() {
  const { address } = useWalletConnection()
  const [slips, setSlips] = useState<PredictionSlip[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch real prediction slips
  useEffect(() => {
    if (address) {
      const fetchSlips = async () => {
        try {
          setLoading(true)
          const response = await fetch(`/api/v1/predictions?user_address=${address}`)
          if (response.ok) {
            const data = await response.json()
            setSlips(data.predictions || [])
          } else {
            setSlips([])
          }
        } catch (error) {
          console.error('Failed to fetch prediction slips:', error)
          setSlips([])
        } finally {
          setLoading(false)
        }
      }
      
      fetchSlips()
    } else {
      setSlips([])
      setLoading(false)
    }
  }, [address])

  const getStatusIcon = (status: string, outcome?: string, winningOutcome?: string) => {
    if (status === 'pending') {
      return <Clock className="w-4 h-4 text-yellow-400" />
    }
    if (status === 'confirmed') {
      return <CheckCircle className="w-4 h-4 text-blue-400" />
    }
    if (status === 'resolved') {
      if (outcome === winningOutcome) {
        return <TrendingUp className="w-4 h-4 text-green-400" />
      } else {
        return <TrendingDown className="w-4 h-4 text-red-400" />
      }
    }
    return <XCircle className="w-4 h-4 text-muted-foreground" />
  }

  const getStatusColor = (status: string, outcome?: string, winningOutcome?: string) => {
    if (status === 'pending') {
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
    if (status === 'confirmed') {
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
    if (status === 'resolved') {
      if (outcome === winningOutcome) {
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      } else {
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      }
    }
    return 'bg-muted/20 text-muted-foreground border-border'
  }

  const getStatusText = (status: string, outcome?: string, winningOutcome?: string) => {
    if (status === 'pending') return 'Pending'
    if (status === 'confirmed') return 'Confirmed'
    if (status === 'resolved') {
      if (outcome === winningOutcome) return 'Won'
      else return 'Lost'
    }
    return 'Unknown'
  }

  if (!address) {
    return (
      <div className="text-center py-12">
        <Receipt className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-muted-foreground">Connect your wallet to view your prediction slips</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-[hsl(208,65%,75%)] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading your prediction slips...</p>
      </div>
    )
  }

  if (slips.length === 0) {
    return (
      <div className="text-center py-12">
        <Receipt className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Prediction Slips</h3>
        <p className="text-muted-foreground">You haven't made any predictions yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Your Prediction Slips</h2>
        <Badge variant="secondary" className="bg-[hsl(208,65%,75%)] text-background">
          {slips.length} slip{slips.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-4">
        {slips.map((slip) => (
          <Card key={slip.id} className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-white mb-2">
                    {slip.marketQuestion}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Prediction: <strong className="text-white">{slip.outcome}</strong></span>
                    <span>Amount: <strong className="text-white">${slip.amount}</strong></span>
                    <span>Price: <strong className="text-white">{slip.price * 100}%</strong></span>
                    <span>Shares: <strong className="text-white">{slip.shares}</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(slip.status, slip.outcome, slip.winningOutcome)}
                  <Badge className={getStatusColor(slip.status, slip.outcome, slip.winningOutcome)}>
                    {getStatusText(slip.status, slip.outcome, slip.winningOutcome)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {new Date(slip.timestamp).toLocaleDateString()} at {new Date(slip.timestamp).toLocaleTimeString()}
                </div>
                {slip.payout && (
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Payout</div>
                    <div className="text-lg font-bold text-green-400">${slip.payout}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
