import React from 'react'
import { X, Receipt, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useScrollLock } from '@/hooks/useScrollLock'

interface PredictionSlipData {
  id: string
  marketId: string
  marketQuestion: string
  marketDescription?: string
  outcome: 'YES' | 'NO'
  amount: number
  price: number
  shares: number
  timestamp: number
  transactionHash: string
  status: 'pending' | 'confirmed' | 'resolved'
  winningOutcome?: 'YES' | 'NO'
  payout?: number
  marketEndTime?: number
  marketResolved?: boolean
}

interface PredictionSlipSidebarProps {
  isOpen: boolean
  onClose: () => void
  slipData: PredictionSlipData | null
}

export function PredictionSlipSidebar({ isOpen, onClose, slipData }: PredictionSlipSidebarProps) {
  // Lock body scroll when sidebar is open
  useScrollLock(isOpen)
  
  if (!isOpen || !slipData) return null

  const getStatusIcon = (status: string, outcome?: string, winningOutcome?: string) => {
    if (status === 'pending') {
      return <Clock className="w-5 h-5 text-yellow-400" />
    }
    if (status === 'confirmed') {
      return <CheckCircle className="w-5 h-5 text-blue-400" />
    }
    if (status === 'resolved') {
      if (outcome === winningOutcome) {
        return <TrendingUp className="w-5 h-5 text-green-400" />
      } else {
        return <TrendingDown className="w-5 h-5 text-red-400" />
      }
    }
    return <XCircle className="w-5 h-5 text-muted-foreground" />
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
    if (status === 'pending') return 'Pending Confirmation'
    if (status === 'confirmed') return 'Confirmed'
    if (status === 'resolved') {
      if (outcome === winningOutcome) return 'Won'
      else return 'Lost'
    }
    return 'Unknown'
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatAmount = (amount: number) => {
    return (amount / 1000000).toFixed(2) // Convert from smallest unit to USDC (6 decimals)
  }

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div 
        className="flex-1 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="w-96 bg-background border-l border-border shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Receipt className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-foreground">Prediction Slip</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
          {/* Status Card */}
          <Card className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Transaction Status</CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusIcon(slipData.status, slipData.outcome, slipData.winningOutcome)}
                  <Badge className={getStatusColor(slipData.status, slipData.outcome, slipData.winningOutcome)}>
                    {getStatusText(slipData.status, slipData.outcome, slipData.winningOutcome)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Transaction Hash:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-900 dark:text-white">
                      {slipData.transactionHash.slice(0, 8)}...{slipData.transactionHash.slice(-8)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(slipData.transactionHash)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Date:</span>
                  <span className="text-slate-900 dark:text-white">{formatDate(slipData.timestamp)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Information */}
          <Card className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Market Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                    {slipData.marketQuestion}
                  </h4>
                  {slipData.marketDescription && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {slipData.marketDescription}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Your Prediction:</span>
                  <Badge className={`${
                    slipData.outcome === 'YES' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {slipData.outcome}
                  </Badge>
                </div>
                {slipData.marketEndTime && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Market Ends:</span>
                    <span className="text-sm text-slate-900 dark:text-white">
                      {formatDate(slipData.marketEndTime)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transaction Details */}
          <Card className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Transaction Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Amount:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatAmount(slipData.amount)} USDC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Price per Share:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {(slipData.price * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Shares Purchased:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {slipData.shares.toLocaleString()}
                  </span>
                </div>
                {slipData.payout && (
                  <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-3">
                    <span className="text-slate-600 dark:text-slate-400">Payout:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatAmount(slipData.payout)} USDC
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.open(`https://sepolia.basescan.org/tx/${slipData.transactionHash}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Explorer
            </Button>
            <Button
              variant="outline"
              onClick={() => copyToClipboard(slipData.transactionHash)}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Hash
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
