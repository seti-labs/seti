"use client"

import { Layout } from "@/components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, DollarSign, CheckCircle, XCircle, FileText, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUserPredictions } from "@/hooks/useUserPredictions"
import { useWalletConnection } from "@/hooks/useWalletConnection"
import { PredictionSlipModal } from "@/components/PredictionSlipModal"
import { PredictionSlips } from "@/components/PredictionSlips"
import { PredictionSlipSidebar } from "@/components/PredictionSlipSidebar"
import { useState } from "react"

export default function Activity() {
  const { isConnected, address, isConnecting, isReady, shouldShowConnectPrompt, isWalletReady } = useWalletConnection()
  const { predictions, isLoading } = useUserPredictions(address)
  const [selectedSlip, setSelectedSlip] = useState<{
    market: any
    prediction: any
  } | null>(null)
  const [sidebarSlip, setSidebarSlip] = useState<any>(null)
  
  // All predictions are fetched from Supabase via backend
  const allPredictions = predictions
  const trades = predictions // All predictions are trades

  // Show loading state while wallet is initializing
  if (!isReady || isConnecting) {
    return (
      <Layout>
        <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-16 max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gradient-gold mb-4">Activity</h1>
            <p className="text-muted-foreground mb-8">Loading wallet connection...</p>
          </div>
        </div>
      </Layout>
    )
  }

  // Show connect prompt if wallet is not connected
  if (shouldShowConnectPrompt) {
    return (
      <Layout>
        <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-16 max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gradient-gold mb-4">Activity</h1>
            <p className="text-muted-foreground mb-8">Connect your wallet to view your activity history</p>
            <Button className="btn-market-gold">Connect Wallet</Button>
          </div>
        </div>
      </Layout>
    )
  }

  const renderPredictionItem = (prediction: any) => {
    const isResolved = prediction.market?.resolved || false
    const isWon = isResolved && prediction.market?.winning_outcome === prediction.outcome
    const isLost = isResolved && prediction.market?.winning_outcome !== prediction.outcome
    const isActive = !isResolved

    return (
      <div
        key={prediction.id}
        className="p-6 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-200 hover:shadow-lg"
      >
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full border border-primary/20">
                {prediction.market?.category || 'Unknown'}
              </span>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  prediction.outcome_label === "YES"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                {prediction.outcome_label}
              </span>
              {isActive && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full border border-blue-200">
                  ACTIVE
                </span>
              )}
              {isWon && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full border border-green-200 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  WON
                </span>
              )}
              {isLost && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-semibold rounded-full border border-gray-200 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  LOST
                </span>
              )}
            </div>
            <h4 className="font-semibold text-lg mb-3 text-foreground line-clamp-2">
              {prediction.market?.question || 'Market data unavailable'}
            </h4>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {new Date(prediction.timestamp * 1000).toLocaleString()}
              </span>
              <span className="font-medium">
                Amount: {(prediction.amount / 1000000).toFixed(2)} USDC
              </span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-3">
            <div className="text-xl font-bold text-foreground">
              {(prediction.amount / 1000000).toFixed(2)} USDC
            </div>
            {isActive ? (
              <div className="text-sm text-muted-foreground">
                {prediction.outcome_label} @ {(prediction.price / 1000000000).toFixed(2)}
              </div>
            ) : (
              <div className={`text-sm font-semibold ${isWon ? "text-green-600" : "text-gray-500"}`}>
                {isWon ? "WON" : "LOST"}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const slipData = {
                  id: prediction.id || prediction.transaction_hash,
                  marketId: prediction.market_id,
                  marketQuestion: prediction.market?.question || 'Market data unavailable',
                  marketDescription: prediction.market?.description,
                  outcome: prediction.outcome_label as 'YES' | 'NO',
                  amount: prediction.amount,
                  price: prediction.price / 1000000000,
                  shares: prediction.shares || 0,
                  timestamp: prediction.timestamp * 1000,
                  transactionHash: prediction.transaction_hash,
                  status: isResolved ? 'resolved' : (prediction.created_at ? 'confirmed' : 'pending'),
                  winningOutcome: prediction.market?.winning_outcome === 1 ? 'YES' : prediction.market?.winning_outcome === 0 ? 'NO' : undefined,
                  payout: isWon ? (prediction.shares || 0) : undefined,
                  marketEndTime: prediction.market?.end_time ? prediction.market.end_time * 1000 : undefined,
                  marketResolved: prediction.market?.resolved
                }
                setSidebarSlip(slipData)
              }}
              className="gap-2 text-sm h-8 hover:bg-primary/10"
            >
              <FileText className="w-4 h-4" />
              View Slip
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 md:py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gradient-gold mb-2">Activity</h1>
          <p className="text-muted-foreground">View your trading history and transactions</p>
        </div>

        {/* Activity Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-muted/50 border border-border/50 w-full sm:w-auto">
            <TabsTrigger value="all">All Activity</TabsTrigger>
            <TabsTrigger value="slips" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Prediction Slips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
                <CardDescription>Your latest transactions and trades</CardDescription>
              </CardHeader>
              <CardContent>
                {allPredictions.length === 0 ? (
                  <div className="text-center py-16">
                    <Clock className="w-20 h-20 mx-auto mb-6 text-muted-foreground/50" />
                    <h3 className="text-2xl font-semibold mb-3 text-foreground">No activity yet</h3>
                    <p className="text-muted-foreground text-lg">Your trading activity will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">{allPredictions.map(renderPredictionItem)}</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="slips" className="space-y-6">
            <PredictionSlips />
          </TabsContent>
        </Tabs>
      </div>

      {/* Prediction Slip Sidebar */}
      <PredictionSlipSidebar
        isOpen={!!sidebarSlip}
        onClose={() => setSidebarSlip(null)}
        slipData={sidebarSlip}
      />

      {/* Prediction Slip Modal (Legacy) */}
      {selectedSlip && (
        <PredictionSlipModal
          isOpen={!!selectedSlip}
          onClose={() => setSelectedSlip(null)}
          market={selectedSlip.market}
          prediction={{
            outcome: selectedSlip.prediction.outcome_label,
            amount: selectedSlip.prediction.amount / 1000000000,
            shares: selectedSlip.prediction.shares || 0,
            price: selectedSlip.prediction.price / 1000000000,
            timestamp: selectedSlip.prediction.timestamp,
            transaction_hash: selectedSlip.prediction.transaction_hash
          }}
        />
      )}
    </Layout>
  )
}

