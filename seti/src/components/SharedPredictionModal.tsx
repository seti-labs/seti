"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, DollarSign, AlertCircle, CheckCircle, Download, Copy, Target } from "lucide-react"
import { type Market, calculatePrices, formatTimeRemaining } from "@/types/contract"
import { usePrediction, savePredictions, getPredictions } from "@/hooks/usePrediction"
import type { PredictionReceipt } from "@/hooks/usePredictionModal"
import { useWalletConnection } from "@/hooks/useWalletConnection"
import { useContract } from "@/hooks/useContract"
import { useScrollLock } from "@/hooks/useScrollLock"
import { PredictionTracker } from "./PredictionTracker"

interface SharedPredictionModalProps {
  isOpen: boolean
  onClose: () => void
  market: Market | null
  outcome: "YES" | "NO" | null
  onShowReceipt: (receipt: PredictionReceipt) => void
}

export function SharedPredictionModal({ isOpen, onClose, market, outcome, onShowReceipt }: SharedPredictionModalProps) {
  const { isConnected } = useWalletConnection()
  const { placePrediction, isLoading, error } = usePrediction()
  const { placeBet, isLoading: contractLoading, error: contractError } = useContract()
  
  // Lock body scroll when modal is open
  useScrollLock(isOpen)
  
  const isSubmitting = isLoading || contractLoading
  const submitError = error || contractError
  const [amount, setAmount] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)
  const [showTracker, setShowTracker] = useState(false)
  const [currentPrediction, setCurrentPrediction] = useState<any>(null)

  // Reduced logging for production
  if (process.env.NODE_ENV === 'development' && isOpen) {
  console.log("SharedPredictionModal render:", { isOpen, market: market?.question, outcome })
  }

  if (!isOpen || !market || !outcome) {
    // Only log in development when modal should be open
    if (process.env.NODE_ENV === 'development' && isOpen) {
    console.log("SharedPredictionModal: Not rendering because:", { isOpen, hasMarket: !!market, outcome })
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      setLocalError("Please connect your wallet first")
      return
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      setLocalError("Please enter a valid amount")
      return
    }

    setLocalError(null)

    try {
      // Use smart contract to place bet
      const result = await placeBet(
        market.id, // Pass as string, let useContract handle conversion
        outcome === "YES" ? 1 : 0,
        amount
      )

      if (result) {
        // Show "Transaction submitted" message first
        setLocalError(null)
        
        // Wait for transaction confirmation using the hook
        const success = await placePrediction({
          marketId: market.id,
          outcome: outcome,
          amount: Number.parseFloat(amount),
        })

        // Only show success message after confirmation
        if (success) {
          const predictions = getPredictions()
          const latestPrediction = predictions[predictions.length - 1]

          // Update with market details
          latestPrediction.marketQuestion = market.question
          latestPrediction.marketCategory = market.category
          latestPrediction.price = outcomePrice

          savePredictions(predictions)

          // Generate receipt
          const receipt: PredictionReceipt = {
            id: latestPrediction.id,
            marketId: market.id,
            marketQuestion: market.question,
            outcome: outcome,
            amount: Number.parseFloat(amount),
            price: outcomePrice,
            potentialPayout: Number.parseFloat(potentialPayout),
            timestamp: new Date(),
            status: "confirmed",
          }

          // Create prediction object for tracker
          const predictionForTracker = {
            id: latestPrediction.id,
            marketId: market.id,
            marketQuestion: market.question,
            outcome: outcome,
            amount: Number.parseFloat(amount),
            price: outcomePrice,
            potentialPayout: Number.parseFloat(potentialPayout),
            timestamp: new Date(),
            status: 'in_progress' as const,
            currentPrice: outcomePrice,
            progress: 0
          }

          setCurrentPrediction(predictionForTracker)
          setShowTracker(true)
          
          onShowReceipt(receipt)
        } else {
          setLocalError("Transaction failed. Please try again.")
        }
      } else {
        setLocalError("Failed to submit transaction. Please try again.")
      }
    } catch (err) {
      console.error('Prediction submission error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to place prediction. Please try again.';
      setLocalError(errorMessage);
    }
  }

  const handleClose = () => {
    setAmount("")
    setLocalError(null)
    onClose()
  }

  const { yesPrice, noPrice } = calculatePrices(market.outcome_a_shares, market.outcome_b_shares)
  const outcomePrice = outcome === "YES" ? yesPrice : noPrice
  const potentialPayout = amount ? ((Number.parseFloat(amount) * 100) / outcomePrice).toFixed(4) : "0"

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div 
        className="flex-1 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Left Sidebar */}
      <div className="w-[500px] bg-background border-r shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gradient-gold font-orbitron">Place Prediction</h2>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Market Info */}
          <div className="mb-6">
            <div className="mb-3">
              <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-sm font-medium border border-primary/30">
                {market.category}
              </span>
            </div>

            <h3 className="text-lg font-bold mb-2 leading-tight">
              <span className="text-gradient-gold font-orbitron">{market.question}</span>
            </h3>

            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{market.description}</p>
          </div>

          {(submitError || localError) && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-destructive text-sm">{submitError || localError}</p>
              </div>
            </div>
          )}

          {/* Market Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/20">
            <div className="text-center">
              <div className="text-lg font-bold text-gradient-gold">
                {yesPrice}¢ / {noPrice}¢
              </div>
              <div className="text-xs text-muted-foreground">YES / NO</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-bold text-gradient-neon">
                ${(market.volume_24h / 1_000_000_000).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">24h Volume</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-bold text-accent">{formatTimeRemaining(market.end_time)}</div>
              <div className="text-xs text-muted-foreground">Time Left</div>
            </div>
          </div>

          {/* Selected Outcome Display */}
          <div className="mb-6 p-4 bg-muted/20">
            <div className="text-center">
              <div className="text-xl font-bold text-gradient-gold mb-1">
                {outcome} - {outcomePrice}¢
              </div>
              <div className="text-sm text-muted-foreground">You selected {outcome} outcome</div>
            </div>
          </div>

          {/* Amount Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Amount (USDC) *
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="0.1"
                  step="0.1"
                  className="pl-10 bg-muted/30 border-border/50"
                />
              </div>
              <p className="text-xs text-muted-foreground">Minimum: 1 USDC</p>
            </div>

            {/* Potential Payout */}
            {amount && Number.parseFloat(amount) > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Potential Payout</Label>
                <div className="p-4 bg-muted/30">
                  <div className="text-lg font-bold text-foreground">{potentialPayout} USDC</div>
                  <div className="text-xs text-muted-foreground">If {outcome} wins (excluding fees)</div>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 transition-all duration-200 hover:scale-105 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={`flex-1 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  outcome === "YES" ? "btn-market-success" : "btn-market-danger"
                }`}
                disabled={isSubmitting || !isConnected || !amount || Number.parseFloat(amount) <= 0}
              >
                {isSubmitting ? "Placing..." : `Place ${outcome} Prediction`}
              </Button>
            </div>
          </form>

          {/* Disclaimer */}
          <div className="mt-6 p-3 bg-muted/10">
            <p className="text-xs text-muted-foreground text-center">
              Predictions are final once placed. Please review all details before confirming.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Receipt Component
interface PredictionReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  receipt: PredictionReceipt | null
}

export function PredictionReceiptModal({ isOpen, onClose, receipt }: PredictionReceiptModalProps) {
  if (!isOpen || !receipt) {
    return null
  }

  const handleDownloadReceipt = () => {
    const receiptText = `
PREDICTION RECEIPT
==================

Receipt ID: ${receipt.id}
Date: ${receipt.timestamp.toLocaleString()}
Status: ${receipt.status.toUpperCase()}

MARKET DETAILS
--------------
Question: ${receipt.marketQuestion}
Market ID: ${receipt.marketId}

PREDICTION DETAILS
------------------
Outcome: ${receipt.outcome}
Amount: ${receipt.amount} USDC
Price: ${receipt.price}¢
Potential Payout: ${receipt.potentialPayout} USDC

Thank you for using seti!
    `.trim()

    const blob = new Blob([receiptText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `prediction-receipt-${receipt.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopyReceipt = () => {
    const receiptText = `Receipt ID: ${receipt.id}\nMarket: ${receipt.marketQuestion}\nOutcome: ${receipt.outcome}\nAmount: ${receipt.amount} USDC\nPrice: ${receipt.price}¢\nPotential Payout: ${receipt.potentialPayout} USDC`
    navigator.clipboard.writeText(receiptText)
  }

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div 
        className="flex-1 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Left Sidebar */}
      <div className="w-[500px] bg-background border-r shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gradient-gold font-orbitron">Prediction Receipt</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </div>

          {/* Receipt Content */}
          <div className="space-y-4 mb-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground mb-2">Prediction Placed Successfully!</h3>
              <p className="text-sm text-muted-foreground">Your {receipt.outcome} prediction has been confirmed</p>
            </div>

            <div className="bg-muted/20 p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Receipt ID:</span>
                <span className="font-mono text-xs">{receipt.id}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Market:</span>
                <span className="text-right text-xs max-w-[200px]">{receipt.marketQuestion}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Outcome:</span>
                <span className={`font-bold ${receipt.outcome === "YES" ? "text-success" : "text-danger"}`}>
                  {receipt.outcome}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold">{receipt.amount} USDC</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-bold">{receipt.price}¢</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Potential Payout:</span>
                <span className="font-bold text-gradient-gold">{receipt.potentialPayout} USDC</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date:</span>
                <span className="text-xs">{receipt.timestamp.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCopyReceipt}
              className="flex-1 transition-all duration-200 hover:scale-105 bg-transparent"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button onClick={handleDownloadReceipt} className="flex-1 transition-all duration-200 hover:scale-105">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          <div className="mt-4 text-center">
            <Button onClick={onClose} className="w-full transition-all duration-200 hover:scale-105">
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Prediction Tracker */}
      {showTracker && currentPrediction && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4">
            <PredictionTracker
              prediction={currentPrediction}
              onClose={() => setShowTracker(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
