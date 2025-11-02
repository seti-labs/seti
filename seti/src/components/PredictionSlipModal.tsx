"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Download, Printer, Copy, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react"
import { type Market } from "@/types/contract"
import { useWalletConnection } from "@/hooks/useWalletConnection"

interface PredictionSlipModalProps {
  isOpen: boolean
  onClose: () => void
  market: Market | null
  prediction: {
    outcome: "YES" | "NO"
    amount: number
    shares: number
    price: number
    timestamp: number
    transaction_hash: string
  } | null
}

export function PredictionSlipModal({ isOpen, onClose, market, prediction }: PredictionSlipModalProps) {
  const { address } = useWalletConnection()
  const [copied, setCopied] = useState(false)

  if (!isOpen || !market || !prediction) {
    return null
  }

  const isResolved = market.resolved
  const isWon = isResolved && market.winning_outcome === (prediction.outcome === "YES" ? 1 : 0)
  const isLost = isResolved && market.winning_outcome !== (prediction.outcome === "YES" ? 1 : 0)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const printSlip = () => {
    window.print()
  }

  const downloadSlip = () => {
    const slipContent = generateSlipContent()
    const blob = new Blob([slipContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prediction-slip-${market.id}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateSlipContent = () => {
    const timestamp = new Date(prediction.timestamp * 1000).toLocaleString()
    const marketEndTime = new Date(market.end_time * 1000).toLocaleString()
    
    return `
SETI PREDICTION SLIP
===================

Market ID: ${market.id}
Question: ${market.question}
Category: ${market.category}
End Time: ${marketEndTime}
Status: ${isResolved ? (isWon ? 'WON' : isLost ? 'LOST' : 'PENDING') : 'ACTIVE'}

Prediction Details:
- Outcome: ${prediction.outcome}
- Amount: ${prediction.amount} USDC
- Shares: ${prediction.shares}
- Price: ${(prediction.price * 100).toFixed(2)}%
- Transaction: ${prediction.transaction_hash}
- Timestamp: ${timestamp}

Wallet Address: ${address}

${isResolved ? `
Resolution:
- Winning Outcome: ${market.winning_outcome === 1 ? 'YES' : 'NO'}
- Result: ${isWon ? 'WON' : 'LOST'}
` : 'Market is still active'}
    `.trim()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-gradient-gold">Prediction Slip</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSlip}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={printSlip}
              className="gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Market Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{market.question}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{market.category}</Badge>
                {isResolved ? (
                  <Badge variant={isWon ? "default" : "destructive"}>
                    {isWon ? "WON" : "LOST"}
                  </Badge>
                ) : (
                  <Badge variant="outline">ACTIVE</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{market.description}</p>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>End Time: {new Date(market.end_time * 1000).toLocaleString()}</p>
                {isResolved && (
                  <p>Winning Outcome: {market.winning_outcome === 1 ? 'YES' : 'NO'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Prediction Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Your Prediction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Outcome</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={prediction.outcome === "YES" ? "default" : "secondary"}>
                      {prediction.outcome}
                    </Badge>
                    {isResolved && (
                      isWon ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : isLost ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : null
                    )}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm text-muted-foreground">Amount</Label>
                  <p className="font-medium">{prediction.amount} USDC</p>
                </div>
                
                <div>
                  <Label className="text-sm text-muted-foreground">Shares</Label>
                  <p className="font-medium">{prediction.shares.toLocaleString()}</p>
                </div>
                
                <div>
                  <Label className="text-sm text-muted-foreground">Price</Label>
                  <p className="font-medium">{(prediction.price * 100).toFixed(2)}%</p>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Transaction Hash</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                    {prediction.transaction_hash}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(prediction.transaction_hash)}
                    className="h-6 w-6 p-0"
                  >
                    {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Timestamp</Label>
                <p className="text-sm">
                  {new Date(prediction.timestamp * 1000).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Wallet Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                  {address}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(address || '')}
                  className="h-6 w-6 p-0"
                >
                  {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={printSlip} className="gap-2">
            <Printer className="w-4 h-4" />
            Print Slip
          </Button>
        </div>
      </div>
    </div>
  )
}
